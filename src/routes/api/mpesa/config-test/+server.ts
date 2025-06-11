import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Test different M-Pesa configurations to find the working one
 */
export const GET: RequestHandler = async () => {
  const configurations = [
    {
      name: 'Your Provided Config',
      consumer_key: 'uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT',
      consumer_secret: 'lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB',
      shortcode: '600426',
      passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
    },
    {
      name: 'Standard Test Config',
      consumer_key: 'uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT',
      consumer_secret: 'lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB',
      shortcode: '174379',
      passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
    }
  ];

  const results = [];

  for (const config of configurations) {
    try {
      console.log(`Testing configuration: ${config.name}`);
      
      // Test OAuth
      const auth = Buffer.from(`${config.consumer_key}:${config.consumer_secret}`).toString('base64');
      
      const oauthResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      const oauthData = await oauthResponse.json();
      
      if (!oauthResponse.ok || !oauthData.access_token) {
        results.push({
          config: config.name,
          oauth_success: false,
          oauth_error: oauthData.error_description || 'No access token',
          stk_test: 'skipped'
        });
        continue;
      }

      // Test STK Push
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString('base64');

      const stkPayload = {
        BusinessShortCode: config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: 1,
        PartyA: '254708374149', // Test number
        PartyB: config.shortcode,
        PhoneNumber: '254708374149',
        CallBackURL: 'https://mydomain.com/api/mpesa/callback',
        AccountReference: 'TEST123',
        TransactionDesc: 'Test payment'
      };

      const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oauthData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stkPayload)
      });

      const stkData = await stkResponse.json();

      results.push({
        config: config.name,
        shortcode: config.shortcode,
        oauth_success: true,
        stk_success: stkResponse.ok && stkData.ResponseCode === '0',
        stk_response: stkData,
        stk_status: stkResponse.status
      });

    } catch (error) {
      results.push({
        config: config.name,
        oauth_success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return json({
    success: true,
    message: 'Configuration test completed',
    results: results,
    recommendation: getRecommendation(results)
  });
};

function getRecommendation(results: any[]) {
  const workingConfig = results.find(r => r.oauth_success && r.stk_success);
  
  if (workingConfig) {
    return `Use configuration: ${workingConfig.config} with shortcode ${workingConfig.shortcode}`;
  }
  
  const oauthWorking = results.find(r => r.oauth_success);
  if (oauthWorking) {
    return `OAuth works but STK Push fails. Check shortcode configuration. Try shortcode ${oauthWorking.shortcode}`;
  }
  
  return 'No working configuration found. Check your M-Pesa credentials.';
}
