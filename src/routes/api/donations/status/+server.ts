import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import { querySTKPushStatus } from '$lib/mpesa';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const donationId = url.searchParams.get('donation_id');
    const checkoutRequestId = url.searchParams.get('checkout_request_id');

    if (!donationId) {
      return json({ 
        success: false, 
        error: 'Donation ID is required' 
      }, { status: 400 });
    }

    // Get donation details
    const donation = db.prepare(`
      SELECT d.*, p.title as project_title, p.id as project_id
      FROM donations d 
      JOIN projects p ON d.project_id = p.id 
      WHERE d.id = ?
    `).get(donationId) as any;

    if (!donation) {
      return json({ 
        success: false, 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    // If donation is already completed or failed, return current status
    if (donation.status === 'completed') {
      return json({
        success: true,
        status: 'completed',
        message: 'Payment completed successfully!',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
          project_title: donation.project_title,
          project_id: donation.project_id,
          transaction_id: donation.mpesa_transaction_id,
          created_at: donation.created_at
        }
      });
    }

    if (donation.status === 'failed') {
      return json({
        success: false,
        status: 'failed',
        message: 'Payment failed. Please try again.',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
          project_title: donation.project_title,
          project_id: donation.project_id,
          created_at: donation.created_at
        }
      });
    }

    // If donation is still pending or processing, check with M-Pesa (for demo, simulate)
    if (donation.status === 'pending' || donation.status === 'processing') {
      // For demo purposes, simulate payment completion after 30 seconds
      const donationTime = new Date(donation.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - donationTime;

      if (timeDiff > 30000) { // 30 seconds for demo
        // Simulate successful payment
        const mpesaTransactionId = `DEMO${Date.now()}`;
        
        // Update donation to completed
        db.prepare(`
          UPDATE donations 
          SET status = 'completed', mpesa_transaction_id = ?
          WHERE id = ?
        `).run(mpesaTransactionId, donationId);

        // Update project current amount
        db.prepare(`
          UPDATE projects 
          SET current_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM donations 
            WHERE project_id = ? AND status = 'completed'
          )
          WHERE id = ?
        `).run(donation.project_id, donation.project_id);

        return json({
          success: true,
          status: 'completed',
          message: 'Payment completed successfully!',
          donation: {
            id: donation.id,
            amount: donation.amount,
            status: 'completed',
            project_title: donation.project_title,
            project_id: donation.project_id,
            transaction_id: mpesaTransactionId,
            created_at: donation.created_at
          }
        });
      } else if (timeDiff > 120000) { // 2 minutes timeout for demo
        // Mark as failed due to timeout
        db.prepare(`
          UPDATE donations 
          SET status = 'failed'
          WHERE id = ?
        `).run(donationId);

        return json({
          success: false,
          status: 'failed',
          message: 'Payment timeout. Please try again.',
          donation: {
            id: donation.id,
            amount: donation.amount,
            status: 'failed',
            project_title: donation.project_title,
            project_id: donation.project_id,
            created_at: donation.created_at
          }
        });
      } else {
        // Still processing
        const remainingTime = Math.max(0, 30 - Math.floor(timeDiff / 1000));
        return json({
          success: true,
          status: 'processing',
          message: `Please complete the payment on your phone. Check your phone for M-Pesa prompt.`,
          remaining_time: remainingTime,
          donation: {
            id: donation.id,
            amount: donation.amount,
            status: 'processing',
            project_title: donation.project_title,
            project_id: donation.project_id,
            created_at: donation.created_at
          }
        });
      }
    }

    // Default response
    return json({
      success: true,
      status: donation.status,
      message: 'Payment status retrieved',
      donation: {
        id: donation.id,
        amount: donation.amount,
        status: donation.status,
        project_title: donation.project_title,
        project_id: donation.project_id,
        created_at: donation.created_at
      }
    });

  } catch (error) {
    console.error('Error checking donation status:', error);
    return json({ 
      success: false, 
      error: 'Failed to check payment status' 
    }, { status: 500 });
  }
};

// POST endpoint to manually update donation status (for testing)
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { donation_id, status, transaction_id } = await request.json();

    if (!donation_id || !status) {
      return json({ 
        success: false, 
        error: 'Donation ID and status are required' 
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return json({ 
        success: false, 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      }, { status: 400 });
    }

    // Get donation
    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(donation_id) as any;
    if (!donation) {
      return json({ 
        success: false, 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    // Update donation status
    const updateQuery = transaction_id 
      ? 'UPDATE donations SET status = ?, mpesa_transaction_id = ? WHERE id = ?'
      : 'UPDATE donations SET status = ? WHERE id = ?';
    
    const params = transaction_id 
      ? [status, transaction_id, donation_id]
      : [status, donation_id];

    db.prepare(updateQuery).run(...params);

    // If completed, update project amount
    if (status === 'completed') {
      db.prepare(`
        UPDATE projects 
        SET current_amount = (
          SELECT COALESCE(SUM(amount), 0) 
          FROM donations 
          WHERE project_id = ? AND status = 'completed'
        )
        WHERE id = ?
      `).run(donation.project_id, donation.project_id);
    }

    return json({
      success: true,
      message: 'Donation status updated successfully'
    });

  } catch (error) {
    console.error('Error updating donation status:', error);
    return json({ 
      success: false, 
      error: 'Failed to update donation status' 
    }, { status: 500 });
  }
};
