import { json } from '@sveltejs/kit';
import { initializeDatabase } from '$lib/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
  try {
    initializeDatabase();
    return json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return json({ error: 'Failed to initialize database' }, { status: 500 });
  }
};
