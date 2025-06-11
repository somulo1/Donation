import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import { initiateSTKPush, mockSTKPush, validatePhoneNumber } from '$lib/mpesa';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const projectId = url.searchParams.get('project_id');
    const limit = url.searchParams.get('limit');

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

    query += ' ORDER BY d.created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const stmt = db.prepare(query);
    const donations = stmt.all(...params);

    // Anonymize donor information for public API
    const anonymizedDonations = donations.map(donation => ({
      ...donation,
      donor_name: donation.donor_name || 'Anonymous',
      donor_email: null, // Never expose email
      phone_number: null, // Never expose phone
      mpesa_transaction_id: donation.status === 'completed' ? 'COMPLETED' : donation.status.toUpperCase()
    }));

    return json(anonymizedDonations);
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

    // Create donation record
    const insertDonation = db.prepare(`
      INSERT INTO donations (project_id, amount, donor_name, donor_email, phone_number, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `);

    const result = insertDonation.run(
      project_id,
      amount,
      donor_name || null,
      donor_email || null,
      phone_number
    );

    const donationId = result.lastInsertRowid;

    try {
      // Initiate Mpesa STK Push
      // For demo purposes, we'll use mock STK Push
      // In production, replace mockSTKPush with initiateSTKPush
      const mpesaResponse = await mockSTKPush(
        phone_number,
        amount,
        `DONATION-${donationId}`,
        `Donation to ${project.title}`
      );

      // Update donation with Mpesa details
      db.prepare(`
        UPDATE donations 
        SET mpesa_transaction_id = ?
        WHERE id = ?
      `).run(mpesaResponse.CheckoutRequestID, donationId);

      // For demo purposes, automatically mark as completed after 3 seconds
      setTimeout(() => {
        try {
          db.prepare(`
            UPDATE donations 
            SET status = 'completed'
            WHERE id = ?
          `).run(donationId);

          // Update project current_amount
          const totalAmount = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM donations 
            WHERE project_id = ? AND status = 'completed'
          `).get(project_id);

          db.prepare(`
            UPDATE projects 
            SET current_amount = ?
            WHERE id = ?
          `).run(totalAmount.total, project_id);
        } catch (error) {
          console.error('Error updating donation status:', error);
        }
      }, 3000);

      return json({
        donation_id: donationId,
        mpesa_response: mpesaResponse,
        message: 'Payment initiated successfully. Please complete the payment on your phone.'
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
