/**
 * ThirdPartyFraudConnector.ts
 * Calls FraudLabs Pro API to check fraud risk for a transaction/order.
 *
 * Endpoint: POST https://api.fraudlabspro.com/v1/order/verify?key=<API_KEY>
 * Required fields: order_id, email, ip_address, amount, phone
 * Free tier: ~500 requests/month. Use judiciously for high-risk or new users.
 *
 * Environment variable: FRAUDLABSPRO_API_KEY
 */

import axios from 'axios';

const FRAUDLABS_API_URL = 'https://api.fraudlabspro.com/v1/order/verify';

/**
 * Calls FraudLabs Pro to check fraud risk for a transaction/order.
 * @param params.email User's email
 * @param params.phone User's phone number
 * @param params.ipAddress User's IP address
 * @param params.amount Transaction amount
 * @returns {Promise<{ riskScore: number; isFraud: boolean; }>} Risk score (0-100) and isFraud flag
 * @throws Error if FraudLabs returns an error
 *
 * Response: { is_spam_score: number, ... }
 */
interface FraudLabsProResponse {
  is_spam_score?: number;
  [key: string]: any;
}

export async function checkFraudLabsOrder(params: { email: string; phone: string; ipAddress: string; amount: number; }): Promise<{ riskScore: number; isFraud: boolean; }> {
  const apiKey = process.env.FRAUDLABSPRO_API_KEY;
  if (!apiKey) throw new Error('Missing FRAUDLABSPRO_API_KEY');
  const orderId = 'order_' + Math.random().toString(36).substring(2, 12);
  try {
    const resp = await axios.post<FraudLabsProResponse>(
      `${FRAUDLABS_API_URL}?key=${apiKey}`,
      {
        order_id: orderId,
        email: params.email,
        ip_address: params.ipAddress,
        amount: params.amount,
        phone: params.phone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const riskScore = resp.data?.is_spam_score ?? 0;
    return {
      riskScore,
      isFraud: riskScore >= 50,
    };
  } catch (err: any) {
    throw new Error('FraudLabs Pro: failed to check order: ' + err.message);
  }
}
