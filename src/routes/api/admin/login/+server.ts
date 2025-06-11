import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import bcrypt from 'bcryptjs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Get user from database by username
    const adminUser = db.prepare(`
      SELECT id, username, password_hash, email
      FROM admin_users
      WHERE username = ?
    `).get(username) as any;

    // Verify password using bcrypt
    if (adminUser && bcrypt.compareSync(password, adminUser.password_hash)) {
      // Create session token (in production, use JWT or proper session management)
      const sessionToken = generateSessionToken();

      // Store session in database (simplified for demo)
      try {
        // Create admin_sessions table if it doesn't exist
        db.exec(`
          CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
          )
        `);

        // Clean up expired sessions
        db.prepare('DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP').run();

        // Create new session (expires in 24 hours)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        db.prepare(`
          INSERT INTO admin_sessions (admin_id, session_token, expires_at)
          VALUES (?, ?, ?)
        `).run(adminUser.id, sessionToken, expiresAt.toISOString());

      } catch (dbError) {
        console.error('Database error during session creation:', dbError);
        // Continue without database session for demo
      }

      return json({
        success: true,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email
        },
        sessionToken
      });
    } else {
      // Invalid credentials
      return json({ error: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
