import type { MpesaResponse } from './types';

/**
 * Get M-Pesa configuration from database settings
 */
async function getMpesaConfig() {
  try {
    // Import database here to avoid circular dependencies
    const { db } = await import('$lib/database');

    const settings = db.prepare(`
      SELECT setting_key, setting_value
      FROM site_settings
      WHERE setting_key IN ('mpesa_consumer_key', 'mpesa_consumer_secret', 'mpesa_business_code', 'mpesa_passkey', 'mpesa_environment')
    `).all() as any[];

    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });

    return {
      consumer_key: process.env.MPESA_CONSUMER_KEY || settingsMap.mpesa_consumer_key || 'uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT',
      consumer_secret: process.env.MPESA_CONSUMER_SECRET || settingsMap.mpesa_consumer_secret || 'lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB',
      business_short_code: process.env.MPESA_SHORTCODE || settingsMap.mpesa_business_code || '174379',
      passkey: process.env.MPESA_PASSKEY || settingsMap.mpesa_passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      callback_url: 'https://mydomain.com/api/mpesa/callback',
      base_url: (settingsMap.mpesa_environment === 'production')
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke'
    };
  } catch (error) {
    console.error('Error loading M-Pesa config from database:', error);
    // Fallback to environment variables and defaults
    return {
      consumer_key: process.env.MPESA_CONSUMER_KEY || 'uNzRpYZ8BOAQApcpuUax9WUi3cA9GqMviC0P0vUug8bGR4yT',
      consumer_secret: process.env.MPESA_CONSUMER_SECRET || 'lddErn3XqkaJHWMm2zSz9o2UFADahr3Rl4L1dnbTRNGi3R7n3eJ2tNMRufbaCHTB',
      business_short_code: process.env.MPESA_SHORTCODE || '174379',
      passkey: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
      callback_url: 'https://mydomain.com/api/mpesa/callback',
      base_url: 'https://sandbox.safaricom.co.ke'
    };
  }
}

/**
 * Generate Mpesa access token
 */
async function getAccessToken(): Promise<string> {
  const config = await getMpesaConfig();
  const auth = Buffer.from(`${config.consumer_key}:${config.consumer_secret}`).toString('base64');

  console.log('Requesting M-Pesa access token...');
  console.log('Base URL:', config.base_url);
  console.log('Consumer Key:', config.consumer_key.substring(0, 10) + '...');

  try {
    const response = await fetch(`${config.base_url}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('M-Pesa OAuth Response:', {
      status: response.status,
      statusText: response.statusText,
    
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${data.error_description || data.errorMessage || 'Unknown error'}`);
    }

    if (!data.access_token) {
      throw new Error('No access token received from M-Pesa API');
    }

    console.log('Access token obtained successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error getting Mpesa access token:', error);
    throw new Error(`Failed to authenticate with Mpesa API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate password for STK push
 */
async function generatePassword(): Promise<string> {
  const config = await getMpesaConfig();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${config.business_short_code}${config.passkey}${timestamp}`).toString('base64');
  return password;
}

/**
 * Get current timestamp in Mpesa format
 */
function getTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}

/**
 * Format phone number for Mpesa (254XXXXXXXXX)
 */
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  phone = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (phone.startsWith('0')) {
    return '254' + phone.slice(1);
  } else if (phone.startsWith('254')) {
    return phone;
  } else if (phone.startsWith('+254')) {
    return phone.slice(1);
  } else if (phone.length === 9) {
    return '254' + phone;
  }
  
  return phone;
}

/**
 * Initiate STK Push payment
 */
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<MpesaResponse> {
  try {
    console.log('Initiating STK Push...');
    console.log('Phone Number:', phoneNumber);
    console.log('Amount:', amount);
    console.log('Account Reference:', accountReference);

    const config = await getMpesaConfig();
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = await generatePassword();
    const formattedPhone = formatPhoneNumber(phoneNumber);

    console.log('Formatted Phone:', formattedPhone);
    console.log('Timestamp:', timestamp);
    console.log('Business Short Code:', config.business_short_code);

    const payload = {
      BusinessShortCode: config.business_short_code,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: config.business_short_code,
      PhoneNumber: formattedPhone,
      CallBackURL: config.callback_url,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    console.log('STK Push Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${config.base_url}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('STK Push Response:', {
      status: response.status,
      statusText: response.statusText,
      
    });

    if (!response.ok) {
      throw new Error(`STK Push failed: ${data.errorMessage || data.errorCode || 'Unknown error'}`);
    }

    if (data.ResponseCode !== '0') {
      throw new Error(`STK Push failed: ${data.ResponseDescription || data.errorMessage || 'Unknown error'}`);
    }

    console.log('STK Push initiated successfully');
    return data;
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw new Error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Query STK Push transaction status
 */
export async function querySTKPushStatus(checkoutRequestID: string): Promise<any> {
  try {
    const config = await getMpesaConfig();
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = await generatePassword();

    const payload = {
      BusinessShortCode: config.business_short_code,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await fetch(`${config.base_url}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Query failed: ${data.errorMessage || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('Error querying STK Push status:', error);
    throw new Error('Failed to check payment status');
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^254[17]\d{8}$/.test(formatted);
}

/**
 * Mock STK Push for development/demo purposes
 */
export async function mockSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<MpesaResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Mock STK Push initiated:', {
    phoneNumber,
    amount,
    accountReference,
    transactionDesc
  });

  // Mock successful response
  return {
    MerchantRequestID: `mock_merchant_${Date.now()}`,
    CheckoutRequestID: `mock_checkout_${Date.now()}`,
    ResponseCode: '0',
    ResponseDescription: 'Success. Request accepted for processing',
    CustomerMessage: 'Success. Request accepted for processing'
  };
}
