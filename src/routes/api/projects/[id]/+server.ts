import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // Get project with current amount
    const project = db.prepare(`
      SELECT 
        p.*,
        COALESCE(SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END), 0) as current_amount,
        COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as donation_count
      FROM projects p
      LEFT JOIN donations d ON p.id = d.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(projectId);

    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    // Update current_amount in database
    db.prepare('UPDATE projects SET current_amount = ? WHERE id = ?')
      .run(project.current_amount, projectId);

    // Get recent donations for this project (anonymized)
    const recentDonations = db.prepare(`
      SELECT 
        amount,
        CASE 
          WHEN donor_name IS NOT NULL AND donor_name != '' THEN donor_name
          ELSE 'Anonymous'
        END as donor_name,
        created_at
      FROM donations 
      WHERE project_id = ? AND status = 'completed'
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(projectId);

    return json({
      ...project,
      recent_donations: recentDonations
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return json({ error: 'Failed to fetch project' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const projectId = parseInt(params.id);
    const data = await request.json();

    if (isNaN(projectId)) {
      return json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const { title, description, target_amount, image_url, category, status } = data;

    // Validate required fields
    if (!title || !description || !target_amount || !category) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (target_amount <= 0) {
      return json({ error: 'Target amount must be greater than 0' }, { status: 400 });
    }

    if (status && !['active', 'completed', 'paused'].includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE projects 
      SET title = ?, description = ?, target_amount = ?, image_url = ?, category = ?, status = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      title, 
      description, 
      target_amount, 
      image_url || null, 
      category, 
      status || 'active',
      projectId
    );

    if (result.changes === 0) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch updated project
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

    return json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return json({ error: 'Failed to update project' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(projectId);

    if (result.changes === 0) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    return json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return json({ error: 'Failed to delete project' }, { status: 500 });
  }
};
