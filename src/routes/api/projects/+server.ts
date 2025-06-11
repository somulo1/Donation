import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const limit = url.searchParams.get('limit');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status') || 'active';

    let query = `
      SELECT
        p.*,
        COALESCE(SUM(CASE WHEN d.status = 'completed' THEN d.amount ELSE 0 END), 0) as current_amount,
        COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as donation_count
      FROM projects p
      LEFT JOIN donations d ON p.id = d.project_id
    `;

    const params: any[] = [];

    if (status !== 'all') {
      query += ' WHERE p.status = ?';
      params.push(status);
    }

    if (category) {
      if (status === 'all') {
        query += ' WHERE p.category = ?';
      } else {
        query += ' AND p.category = ?';
      }
      params.push(category);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const stmt = db.prepare(query);
    const projects = stmt.all(...params);

    // Update current_amount in database for each project
    const updateStmt = db.prepare('UPDATE projects SET current_amount = ? WHERE id = ?');
    for (const project of projects) {
      updateStmt.run(project.current_amount, project.id);
    }

    return json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, description, target_amount, image_url, category } = data;

    // Validate required fields
    if (!title || !description || !target_amount || !category) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (target_amount <= 0) {
      return json({ error: 'Target amount must be greater than 0' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO projects (title, description, target_amount, image_url, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, description, target_amount, image_url || null, category);

    // Fetch the created project
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    return json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return json({ error: 'Failed to create project' }, { status: 500 });
  }
};
