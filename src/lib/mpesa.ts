import type { MpesaResponse } from './types';

// Mpesa API configuration
const MPESA_CONFIG = {
  consumer_key: process.env.MPESA_CONSUMER_KEY || 'your_consumer_key',
  consumer_secret: process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret',
  business_short_code: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
  passkey: process.env.MPESA_PASSKEY || 'your_passkey',
  callback_url: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback',
  base_url: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'
};

/**
 * Generate Mpesa access token
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${MPESA_CONFIG.consumer_key}:${MPESA_CONFIG.consumer_secret}`).toString('base64');
  
  try {
    const response = await fetch(`${MPESA_CONFIG.base_url}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${data.error_description || 'Unknown error'}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error getting Mpesa access token:', error);
    throw new Error('Failed to authenticate with Mpesa API');
  }
}

/**
 * Generate password for STK push
 */
function generatePassword(): string {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_CONFIG.business_short_code}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
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
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword();
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const payload = {
      BusinessShortCode: MPESA_CONFIG.business_short_code,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.business_short_code,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callback_url,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    const response = await fetch(`${MPESA_CONFIG.base_url}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`STK Push failed: ${data.errorMessage || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw new Error('Failed to initiate payment. Please try again.');
  }
}

/**
 * Query STK Push transaction status
 */
export async function querySTKPushStatus(checkoutRequestID: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword();

    const payload = {
      BusinessShortCode: MPESA_CONFIG.business_short_code,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await fetch(`${MPESA_CONFIG.base_url}/mpesa/stkpushquery/v1/query`, {
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
  
  // Mock successful response
  return {
    MerchantRequestID: `mock_merchant_${Date.now()}`,
    CheckoutRequestID: `mock_checkout_${Date.now()}`,
    ResponseCode: '0',
    ResponseDescription: 'Success. Request accepted for processing',
    CustomerMessage: 'Success. Request accepted for processing'
  };
}
