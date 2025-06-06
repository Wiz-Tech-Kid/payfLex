/**
 * FraudLabsConnector.ts
 * Wraps calls to FraudLabs Pro for order verification.
 *
 * Environment variable: FRAUDLABSPRO_API_KEY
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const FRAUDLABSPRO_API_KEY = process.env.FRAUDLABSPRO_API_KEY!;
const FRAUDLABS_API_URL = 'https://api.fraudlabspro.com/v1/order/verify';

/**
 * Calls FraudLabs Pro to check fraud risk for a transaction/order.
 * @param params.email User's email
 * @param params.phone User's phone number
 * @param params.ipAddress User's IP address
 * @param params.amount Transaction amount
 * @returns {Promise<{ riskScore: number; isFraud: boolean }>} Risk score (0-100) and isFraud flag
 * @throws Error if FraudLabs returns an error
 *
 * Endpoint: POST https://api.fraudlabspro.com/v1/order/verify?key=API_KEY
 * Headers: Content-Type: application/json
 * Body: { order_id, email, ip_address, amount, phone }
 * Response: { is_spam_score: number, ... }
 * Example response: { "is_spam_score": 42, ... }
 */
export async function checkFraudLabsOrder(params: { email: string; phone: string; ipAddress: string; amount: number; }): Promise<{ riskScore: number; isFraud: boolean; }> {
  if (!FRAUDLABSPRO_API_KEY) throw new Error('Missing FRAUDLABSPRO_API_KEY');
  const orderId = uuidv4();
  try {
    interface FraudLabsResponse {
      is_spam_score?: number;
      [key: string]: any;
    }

    const resp = await axios.post<FraudLabsResponse>(
      `${FRAUDLABS_API_URL}?key=${FRAUDLABSPRO_API_KEY}`,
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
