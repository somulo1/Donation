import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Simulate M-Pesa payment notification
 * This endpoint simulates receiving a payment notification
 * In production, this would be replaced by actual M-Pesa notifications
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { donation_id, phone_number, amount, success = true } = await request.json();

    if (!donation_id || !phone_number || !amount) {
      return json({ 
        success: false, 
        error: 'Missing required fields: donation_id, phone_number, amount' 
      }, { status: 400 });
    }

    // Generate a mock transaction ID
    const transaction_id = `MOCK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Prepare notification data
    const notificationData = {
      phone_number,
      amount: parseFloat(amount),
      transaction_id,
      reference: donation_id.toString(),
      status: success ? 'completed' : 'failed'
    };

    // Send notification to our notification endpoint
    const notificationResponse = await fetch(`${request.url.replace('/simulate-notification', '/notification')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const notificationResult = await notificationResponse.json();

    if (notificationResult.success) {
      return json({
        success: true,
        message: 'Payment notification simulated successfully',
        transaction_id,
        donation_id,
        status: notificationData.status
      });
    } else {
      return json({
        success: false,
        error: notificationResult.error || 'Failed to process notification'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error simulating M-Pesa notification:', error);
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};

/**
 * Get pending donations for testing
 * This helps identify which donations can be simulated
 */
export const GET: RequestHandler = async () => {
  try {
    const { db } = await import('$lib/database');
    
    const pendingDonations = db.prepare(`
      SELECT 
        d.id,
        d.amount,
        d.phone_number,
        d.status,
        d.created_at,
        p.title as project_title
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
      LIMIT 10
    `).all();

    return json({
      success: true,
      pending_donations: pendingDonations,
      message: `Found ${pendingDonations.length} pending donations`
    });

  } catch (error) {
    console.error('Error fetching pending donations:', error);
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};
