import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

const UPLOAD_DIR = 'static/uploads/projects';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    console.log('FormData received');
    const file = formData.get('image') as File;
    console.log('File extracted:', file ? file.name : 'no file');

    if (!file) {
      console.log('No file provided');
      return json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return json({ 
        error: 'File size too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.name);
    const filename = `project_${timestamp}_${randomString}${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await writeFile(filepath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/projects/${filename}`;

    return json({
      success: true,
      imageUrl,
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return json({ 
      error: 'Failed to upload image. Please try again.' 
    }, { status: 500 });
  }
};

// Optional: Add DELETE endpoint to remove uploaded images
export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const filename = url.searchParams.get('filename');
    
    if (!filename) {
      return json({ error: 'Filename is required' }, { status: 400 });
    }

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = path.join(UPLOAD_DIR, filename);
    
    if (existsSync(filepath)) {
      const fs = await import('fs/promises');
      await fs.unlink(filepath);
      return json({ success: true, message: 'Image deleted successfully' });
    } else {
      return json({ error: 'Image not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    return json({ 
      error: 'Failed to delete image' 
    }, { status: 500 });
  }
};
