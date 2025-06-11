import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const callbackData = await request.json();
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    // Extract callback data
    const { Body } = callbackData;
    const { stkCallback } = Body;

    if (!stkCallback) {
      console.error('Invalid callback format - missing stkCallback');
      return json({ ResultCode: 1, ResultDesc: 'Invalid callback format' });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    console.log('Processing callback for CheckoutRequestID:', CheckoutRequestID);
    console.log('Result Code:', ResultCode, 'Result Description:', ResultDesc);

    // Find the donation record
    const donation = db.prepare(`
      SELECT * FROM donations 
      WHERE mpesa_transaction_id = ?
    `).get(CheckoutRequestID) as any;

    if (!donation) {
      console.error('Donation not found for CheckoutRequestID:', CheckoutRequestID);
      return json({ ResultCode: 1, ResultDesc: 'Donation not found' });
    }

    if (ResultCode === 0) {
      // Payment successful
      console.log('Payment successful for donation ID:', donation.id);

      let mpesaReceiptNumber = '';
      let transactionDate = '';
      let phoneNumber = '';
      let amount = 0;

      // Extract metadata if available
      if (CallbackMetadata && CallbackMetadata.Item) {
        for (const item of CallbackMetadata.Item) {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              mpesaReceiptNumber = item.Value;
              break;
            case 'TransactionDate':
              transactionDate = item.Value;
              break;
            case 'PhoneNumber':
              phoneNumber = item.Value;
              break;
            case 'Amount':
              amount = item.Value;
              break;
          }
        }
      }

      console.log('Payment details:', {
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
        amount
      });

      // Update donation status to completed
      const updateResult = db.prepare(`
        UPDATE donations 
        SET 
          status = 'completed',
          mpesa_transaction_id = ?
        WHERE id = ?
      `).run(mpesaReceiptNumber || CheckoutRequestID, donation.id);

      console.log('Donation updated:', updateResult.changes, 'rows affected');

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

      console.log('Project amount updated:', projectUpdateResult.changes, 'rows affected');

      // Log successful transaction
      console.log(`✅ Payment completed successfully:
        - Donation ID: ${donation.id}
        - Amount: KES ${donation.amount}
        - M-Pesa Receipt: ${mpesaReceiptNumber}
        - Project ID: ${donation.project_id}
      `);

    } else {
      // Payment failed or cancelled
      console.log('Payment failed for donation ID:', donation.id, 'Reason:', ResultDesc);

      // Update donation status to failed
      const updateResult = db.prepare(`
        UPDATE donations 
        SET status = 'failed'
        WHERE id = ?
      `).run(donation.id);

      console.log('Donation marked as failed:', updateResult.changes, 'rows affected');

      // Log failed transaction
      console.log(`❌ Payment failed:
        - Donation ID: ${donation.id}
        - Amount: KES ${donation.amount}
        - Reason: ${ResultDesc}
        - Result Code: ${ResultCode}
      `);
    }

    // Always return success to M-Pesa to acknowledge receipt
    return json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    
    // Still return success to M-Pesa to avoid retries
    return json({
      ResultCode: 0,
      ResultDesc: 'Callback received but processing failed'
    });
  }
};

// Handle timeout callbacks
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const timeoutData = await request.json();
    console.log('M-Pesa Timeout Received:', JSON.stringify(timeoutData, null, 2));

    // Extract timeout data
    const { Body } = timeoutData;
    const { stkCallback } = Body;

    if (stkCallback && stkCallback.CheckoutRequestID) {
      const { CheckoutRequestID } = stkCallback;

      // Find and update the donation
      const donation = db.prepare(`
        SELECT * FROM donations 
        WHERE mpesa_transaction_id = ?
      `).get(CheckoutRequestID) as any;

      if (donation) {
        // Mark as failed due to timeout
        db.prepare(`
          UPDATE donations 
          SET status = 'failed'
          WHERE id = ?
        `).run(donation.id);

        console.log(`⏰ Payment timeout for donation ID: ${donation.id}`);
      }
    }

    return json({
      ResultCode: 0,
      ResultDesc: 'Timeout processed successfully'
    });

  } catch (error) {
    console.error('Error processing M-Pesa timeout:', error);
    
    return json({
      ResultCode: 0,
      ResultDesc: 'Timeout received but processing failed'
    });
  }
};
