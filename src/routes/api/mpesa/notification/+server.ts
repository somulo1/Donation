import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

/**
 * Handle Mpesa payment notifications
 * This endpoint receives notifications about successful payments
 * and updates the donation status accordingly
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const notificationData = await request.json();
    console.log('Mpesa Notification Received:', JSON.stringify(notificationData, null, 2));

    const {
      phone_number,
      amount,
      transaction_id,
      reference,
      status = 'completed'
    } = notificationData;

    // Validate required fields
    if (!phone_number || !amount || !transaction_id || !reference) {
      return json({ 
        success: false, 
        error: 'Missing required fields: phone_number, amount, transaction_id, reference' 
      }, { status: 400 });
    }

    // Find the donation by reference (which should be the donation ID)
    const donation = db.prepare(`
      SELECT d.*, p.title as project_title
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.id = ? AND d.status = 'pending'
    `).get(reference) as any;

    if (!donation) {
      console.error('Donation not found or already processed:', reference);
      return json({ 
        success: false, 
        error: 'Donation not found or already processed' 
      }, { status: 404 });
    }

    // Verify amount matches
    if (Math.abs(donation.amount - parseFloat(amount)) > 0.01) {
      console.error('Amount mismatch:', { expected: donation.amount, received: amount });
      return json({ 
        success: false, 
        error: 'Amount mismatch' 
      }, { status: 400 });
    }

    // Update donation status (no personal data to remove since none is stored)
    const updateResult = db.prepare(`
      UPDATE donations
      SET
        status = ?,
        mpesa_transaction_id = ?
      WHERE id = ?
    `).run(status, transaction_id, donation.id);

    if (updateResult.changes === 0) {
      return json({ 
        success: false, 
        error: 'Failed to update donation' 
      }, { status: 500 });
    }

    // Update project current amount if payment was successful
    if (status === 'completed') {
      const projectUpdateResult = db.prepare(`
        UPDATE projects 
        SET current_amount = (
          SELECT COALESCE(SUM(amount), 0) 
          FROM donations 
          WHERE project_id = ? AND status = 'completed'
        )
        WHERE id = ?
      `).run(donation.project_id, donation.project_id);

      console.log('Project amount updated:', projectUpdateResult.changes, 'rows affected');
    }

    console.log('Donation updated successfully:', {
      donationId: donation.id,
      status,
      transactionId: transaction_id,
      amount: donation.amount
    });

    return json({
      success: true,
      message: 'Payment notification processed successfully',
      donation_id: donation.id,
      status
    });

  } catch (error) {
    console.error('Error processing Mpesa notification:', error);
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};

/**
 * Manual payment confirmation endpoint
 * This allows manual confirmation of payments when automatic notification fails
 */
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { donation_id, transaction_id, confirmed_by } = await request.json();

    if (!donation_id || !transaction_id) {
      return json({ 
        success: false, 
        error: 'Missing required fields: donation_id, transaction_id' 
      }, { status: 400 });
    }

    // Find the donation
    const donation = db.prepare(`
      SELECT d.*, p.title as project_title
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE d.id = ? AND d.status = 'pending'
    `).get(donation_id) as any;

    if (!donation) {
      return json({ 
        success: false, 
        error: 'Donation not found or already processed' 
      }, { status: 404 });
    }

    // Update donation status (no personal data to remove since none is stored)
    const updateResult = db.prepare(`
      UPDATE donations
      SET
        status = 'completed',
        mpesa_transaction_id = ?
      WHERE id = ?
    `).run(transaction_id, donation.id);

    if (updateResult.changes === 0) {
      return json({ 
        success: false, 
        error: 'Failed to update donation' 
      }, { status: 500 });
    }

    // Update project current amount
    const projectUpdateResult = db.prepare(`
      UPDATE projects 
      SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM donations 
        WHERE project_id = ? AND status = 'completed'
      )
      WHERE id = ?
    `).run(donation.project_id, donation.project_id);

    console.log('Manual payment confirmation:', {
      donationId: donation.id,
      transactionId: transaction_id,
      confirmedBy: confirmed_by || 'system',
      amount: donation.amount
    });

    return json({
      success: true,
      message: 'Payment confirmed successfully',
      donation_id: donation.id
    });

  } catch (error) {
    console.error('Error confirming payment manually:', error);
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
};
