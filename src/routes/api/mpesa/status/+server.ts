import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import { querySTKPushStatus } from '$lib/mpesa';
import type { RequestHandler } from './$types';

/**
 * Check payment status for a donation
 * This endpoint checks both local database status and queries M-Pesa API if needed
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const donationId = url.searchParams.get('donation_id');
    const checkoutRequestId = url.searchParams.get('checkout_request_id');

    if (!donationId) {
      return json({ 
        success: false, 
        error: 'Missing donation_id parameter' 
      }, { status: 400 });
    }

    // Get donation from database
    const donation = db.prepare(`
      SELECT d.*, p.title as project_title
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.id = ?
    `).get(donationId) as any;

    if (!donation) {
      return json({ 
        success: false, 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    // If donation is already completed, return success
    if (donation.status === 'completed') {
      return json({
        success: true,
        status: 'completed',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
          mpesa_transaction_id: donation.mpesa_transaction_id,
          project_title: donation.project_title,
          created_at: donation.created_at
        },
        message: 'Payment completed successfully'
      });
    }

    // If donation is failed, return failure
    if (donation.status === 'failed') {
      return json({
        success: false,
        status: 'failed',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
          project_title: donation.project_title,
          created_at: donation.created_at
        },
        message: 'Payment failed'
      });
    }

    // If donation is still pending, check with M-Pesa API if we have checkout request ID
    if (donation.status === 'pending' && checkoutRequestId) {
      try {
        const mpesaStatus = await querySTKPushStatus(checkoutRequestId);
        
        // Process M-Pesa response
        if (mpesaStatus.ResultCode === '0') {
          // Payment successful - update donation
          const updateResult = db.prepare(`
            UPDATE donations 
            SET 
              status = 'completed',
              mpesa_transaction_id = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(mpesaStatus.MpesaReceiptNumber || checkoutRequestId, donation.id);

          if (updateResult.changes > 0) {
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
              donation: {
                id: donation.id,
                amount: donation.amount,
                status: 'completed',
                mpesa_transaction_id: mpesaStatus.MpesaReceiptNumber || checkoutRequestId,
                project_title: donation.project_title,
                created_at: donation.created_at
              },
              message: 'Payment completed successfully'
            });
          }
        } else if (mpesaStatus.ResultCode === '1032') {
          // Payment cancelled by user
          db.prepare(`
            UPDATE donations 
            SET status = 'cancelled'
            WHERE id = ?
          `).run(donation.id);

          return json({
            success: false,
            status: 'cancelled',
            donation: {
              id: donation.id,
              amount: donation.amount,
              status: 'cancelled',
              project_title: donation.project_title,
              created_at: donation.created_at
            },
            message: 'Payment was cancelled'
          });
        } else {
          // Other failure codes
          const errorMessage = mpesaStatus.ResultDesc || 'Payment failed';
          
          db.prepare(`
            UPDATE donations 
            SET status = 'failed'
            WHERE id = ?
          `).run(donation.id);

          return json({
            success: false,
            status: 'failed',
            donation: {
              id: donation.id,
              amount: donation.amount,
              status: 'failed',
              project_title: donation.project_title,
              created_at: donation.created_at
            },
            message: errorMessage
          });
        }
      } catch (mpesaError) {
        console.error('Error querying M-Pesa status:', mpesaError);
        // Continue with pending status if M-Pesa query fails
      }
    }

    // Check if payment has been pending too long (more than 5 minutes)
    const createdAt = new Date(donation.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (timeDiff > fiveMinutes) {
      // Mark as expired
      db.prepare(`
        UPDATE donations 
        SET status = 'expired'
        WHERE id = ?
      `).run(donation.id);

      return json({
        success: false,
        status: 'expired',
        donation: {
          id: donation.id,
          amount: donation.amount,
          status: 'expired',
          project_title: donation.project_title,
          created_at: donation.created_at
        },
        message: 'Payment request has expired. Please try again.'
      });
    }

    // Still pending
    return json({
      success: true,
      status: 'pending',
      donation: {
        id: donation.id,
        amount: donation.amount,
        status: donation.status,
        project_title: donation.project_title,
        created_at: donation.created_at
      },
      message: 'Payment is still pending. Please complete the M-Pesa transaction on your phone.'
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};
