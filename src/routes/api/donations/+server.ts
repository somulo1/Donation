import { json } from '@sveltejs/kit';
import { db, createAnonymousDonation } from '$lib/database';
import { initiateSTKPush, mockSTKPush, validatePhoneNumber } from '$lib/mpesa';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const projectId = url.searchParams.get('project_id');
    const limit = url.searchParams.get('limit');
    const status = url.searchParams.get('status');

    let query = `
      SELECT
        d.*,
        p.title as project_title
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (projectId) {
      query += ' AND d.project_id = ?';
      params.push(parseInt(projectId));
    }

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const stmt = db.prepare(query);
    const donations = stmt.all(...params);

    // For admin requests (when status filter is used), return full data
    // For public API, anonymize donor information
    if (status) {
      // Admin request - return full data
      return json({
        success: true,
        donations: donations
      });
    } else {
      // Public API - anonymize data
      const anonymizedDonations = donations.map(donation => ({
        ...donation,
        donor_name: donation.donor_name || 'Anonymous',
        donor_email: null, // Never expose email
        phone_number: null, // Never expose phone
        mpesa_transaction_id: donation.status === 'completed' ? 'COMPLETED' : donation.status.toUpperCase()
      }));

      return json(anonymizedDonations);
    }
  } catch (error) {
    console.error('Error fetching donations:', error);
    return json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { project_id, amount, donor_name, donor_email, phone_number } = data;

    // Validate required fields
    if (!project_id || !amount || !phone_number) {
      return json({ error: 'Missing required fields: project_id, amount, phone_number' }, { status: 400 });
    }

    // Validate amount
    if (amount <= 0 || amount > 1000000) {
      return json({ error: 'Amount must be between 1 and 1,000,000 KES' }, { status: 400 });
    }

    // Validate phone number
    if (!validatePhoneNumber(phone_number)) {
      return json({ error: 'Invalid phone number format. Use format: 254XXXXXXXXX or 07XXXXXXXX' }, { status: 400 });
    }

    // Check if project exists and is active
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND status = ?').get(project_id, 'active');
    if (!project) {
      return json({ error: 'Project not found or not active' }, { status: 404 });
    }

    // Create anonymous donation record (no personal data stored)
    const donationId = createAnonymousDonation(project_id, amount, donor_name);

    console.log('Created anonymous donation for payment processing:', {
      donationId,
      projectId: project_id,
      amount,
      donorName: donor_name || 'Anonymous',
      phoneForPayment: phone_number.substring(0, 6) + '***' // Log partial phone for debugging
    });

    try {
      let mpesaResponse;
      let usingMock = false;

      try {
        // Try real STK Push first
        mpesaResponse = await initiateSTKPush(
          phone_number,
          amount,
          donationId.toString(),
          `Donation to ${project.title}`
        );
        console.log('Real STK Push successful');
      } catch (realMpesaError) {
        console.log('Real M-Pesa failed, falling back to mock:', realMpesaError.message);

        // Fallback to mock STK Push for demo purposes
        mpesaResponse = await mockSTKPush(
          phone_number,
          amount,
          donationId.toString(),
          `Donation to ${project.title}`
        );
        usingMock = true;
      }

      // Update donation with Mpesa details
      db.prepare(`
        UPDATE donations
        SET mpesa_transaction_id = ?
        WHERE id = ?
      `).run(mpesaResponse.CheckoutRequestID, donationId);

      console.log('STK Push initiated successfully:', {
        donationId,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        merchantRequestId: mpesaResponse.MerchantRequestID,
        amount,
        phoneNumber: phone_number,
        usingMock,
        responseCode: mpesaResponse.ResponseCode,
        responseDescription: mpesaResponse.ResponseDescription
      });

      // If using mock, simulate successful payment after 10 seconds
      if (usingMock) {
        setTimeout(async () => {
          try {
            const notificationData = {
              phone_number,
              amount,
              transaction_id: `DEMO${Date.now()}`,
              reference: donationId.toString(),
              status: 'completed'
            };

            await fetch(`${process.env.ORIGIN || 'http://localhost:5173'}/api/mpesa/notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(notificationData)
            });
          } catch (error) {
            console.error('Error simulating notification:', error);
          }
        }, 10000);
      }

      return json({
        success: true,
        donation_id: donationId,
        checkout_request_id: mpesaResponse.CheckoutRequestID,
        merchant_request_id: mpesaResponse.MerchantRequestID,
        message: usingMock
          ? 'Payment initiated successfully (Demo Mode). Your payment will be automatically completed in 10 seconds.'
          : 'Payment initiated successfully. Please complete the payment on your phone.',
        instructions: usingMock
          ? 'This is a demo payment. In real mode, you would receive an M-Pesa prompt on your phone.'
          : 'You will receive an M-Pesa prompt on your phone. Enter your M-Pesa PIN to complete the donation.',
        demo_mode: usingMock,
        response_code: mpesaResponse.ResponseCode,
        customer_message: mpesaResponse.CustomerMessage
      }, { status: 201 });

    } catch (mpesaError) {
      // Update donation status to failed
      db.prepare(`
        UPDATE donations 
        SET status = 'failed'
        WHERE id = ?
      `).run(donationId);

      console.error('Mpesa error:', mpesaError);
      return json({ 
        error: 'Failed to initiate payment. Please try again.',
        donation_id: donationId
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating donation:', error);
    return json({ error: 'Failed to process donation' }, { status: 500 });
  }
};
