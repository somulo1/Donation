import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Test M-Pesa credentials and connectivity
 */
export const GET: RequestHandler = async () => {
  try {
    // Test M-Pesa OAuth
    const auth = Buffer.from(`uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT:lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB`).toString('base64');
    
    console.log('Testing M-Pesa OAuth...');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('M-Pesa OAuth Test Response:', {
      status: response.status,
      statusText: response.statusText,
    
    });

    if (!response.ok) {
      return json({
        success: false,
        error: 'Failed to authenticate with M-Pesa',
        details: data,
        status: response.status
      });
    }

    if (!data.access_token) {
      return json({
        success: false,
        error: 'No access token received',
        details: data
      });
    }

    return json({
      success: true,
      message: 'M-Pesa credentials are valid',
      access_token_received: true,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('Error testing M-Pesa credentials:', error);
    return json({
      success: false,
      error: 'Network error while testing M-Pesa credentials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

/**
 * Test STK Push with provided phone number
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { phone_number, amount = 1 } = await request.json();

    if (!phone_number) {
      return json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 });
    }

    // Import M-Pesa functions
    const { initiateSTKPush } = await import('$lib/mpesa');

    console.log('Testing STK Push with phone:', phone_number);

    const result = await initiateSTKPush(
      phone_number,
      amount,
      'TEST123',
      'Test payment'
    );

    return json({
      success: true,
      message: 'STK Push initiated successfully',
      result: result
    });

  } catch (error) {
    console.error('Error testing STK Push:', error);
    return json({
      success: false,
      error: 'Failed to initiate STK Push',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};
