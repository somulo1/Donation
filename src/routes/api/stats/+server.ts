import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    // Get total projects
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
    
    // Get active projects
    const activeProjects = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?').get('active') as { count: number };
    
    // Get total donations
    const totalDonations = db.prepare('SELECT COUNT(*) as count FROM donations WHERE status = ?').get('completed') as { count: number };
    
    // Get total amount raised
    const totalAmount = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = ?').get('completed') as { total: number };
    
    // Get recent donations (anonymized)
    const recentDonations = db.prepare(`
      SELECT 
        d.amount,
        CASE 
          WHEN d.donor_name IS NOT NULL AND d.donor_name != '' THEN d.donor_name
          ELSE 'Anonymous'
        END as donor_name,
        d.created_at,
        p.title as project_title
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.status = 'completed'
      ORDER BY d.created_at DESC 
      LIMIT 10
    `).all();

    // Get donations by category
    const donationsByCategory = db.prepare(`
      SELECT 
        p.category,
        COUNT(d.id) as donation_count,
        COALESCE(SUM(d.amount), 0) as total_amount
      FROM projects p
      LEFT JOIN donations d ON p.id = d.project_id AND d.status = 'completed'
      GROUP BY p.category
      ORDER BY total_amount DESC
    `).all();

    // Get monthly donation trends (last 6 months)
    const monthlyTrends = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as donation_count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM donations 
      WHERE status = 'completed' 
        AND created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
    `).all();

    return json({
      total_projects: totalProjects.count,
      active_projects: activeProjects.count,
      total_donations: totalDonations.count,
      total_amount_raised: totalAmount.total,
      recent_donations: recentDonations,
      donations_by_category: donationsByCategory,
      monthly_trends: monthlyTrends
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
};
