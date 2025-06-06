/**
 * GSMAAdapter.ts
 *
 * Provides a unified interface for initiating and checking the status of mobile money payments via any GSMA-compliant provider (e.g., Orange, Mascom, BTC) through a single gateway.
 *
 * Environment variables:
 *   - GSMA_BASE_URL: Base URL for the GSMA gateway (e.g., https://sandbox.gsma-gateway.com)
 *   - GSMA_API_KEY: API key for authenticating requests
 *   - GSMA_USERNAME: (optional) Username for additional authentication
 *   - GSMA_ENV: 'sandbox' or 'production' (affects endpoint behavior)
 */

import axios from 'axios';

const BASE_URL = process.env.GSMA_BASE_URL;
const API_KEY = process.env.GSMA_API_KEY;
const USERNAME = process.env.GSMA_USERNAME;
const ENV = process.env.GSMA_ENV || 'sandbox';

/**
 * Initialize a GSMA mobile money payment for a given provider.
 *
 * Endpoint: `${GSMA_BASE_URL}/v1/payments`
 * Method: POST
 * Headers:
 *   - Authorization: Bearer <GSMA_API_KEY>
 *   - Username: <GSMA_USERNAME> (if required)
 * Body (JSON):
 *   {
 *     provider: 'ORANGE' | 'MASCOM' | 'BTC',
 *     amount: number,
 *     currency: string,
 *     subscriberPhone: string, // E.164 format
 *     externalReference: string
 *   }
 *
 * Example response:
 *   {
 *     transactionId: string,
 *     paymentUrl: string
 *   }
 *
 * @param params - Payment details
 * @returns { transactionId, paymentUrl }
 * @throws Error if the request fails
 *
 * The `provider` field allows switching between Orange, Mascom, and BTC using a single credential set.
 *
 * Sandbox vs. production: The GSMA_ENV variable determines which environment is used.
 */
export async function initializeGsmaPayment(params: {
  provider: 'ORANGE' | 'MASCOM' | 'BTC';
  amount: number;
  currency: string;
  subscriberPhone: string;
  referenceId: string;
}): Promise<{ transactionId: string; paymentUrl: string }> {
  try {
    const url = `${BASE_URL}/v1/payments`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    };
    if (USERNAME) headers['Username'] = USERNAME;
    const body = {
      provider: params.provider,
      amount: params.amount,
      currency: params.currency,
      subscriberPhone: params.subscriberPhone,
      externalReference: params.referenceId,
    };
    const res = await axios.post(url, body, { headers });
    /**
     * Response JSON:
     *   {
     *     transactionId: string,
     *     paymentUrl: string
     *   }
     */
    const data = res.data as { transactionId: string; paymentUrl: string };
    return {
      transactionId: data.transactionId,
      paymentUrl: data.paymentUrl,
    };
  } catch (error: any) {
    throw new Error(
      `GSMAAdapter: failed to initialize payment for provider ${params.provider}: ${error?.response?.data?.message || error.message}`
    );
  }
}

/**
 * Check the status of a GSMA mobile money transaction.
 *
 * Endpoint: `${GSMA_BASE_URL}/v1/payments/{transactionId}`
 * Method: GET
 * Headers:
 *   - Authorization: Bearer <GSMA_API_KEY>
 *   - Username: <GSMA_USERNAME> (if required)
 *
 * Example response:
 *   {
 *     status: 'pending' | 'success' | 'failed',
 *     ...
 *   }
 *
 * Maps GSMA status codes to:
 *   - 'pending'   => 'PENDING'
 *   - 'success'   => 'SUCCESS'
 *   - 'failed'    => 'FAILED'
 *
 * @param transactionId - The GSMA transaction ID
 * @returns 'PENDING' | 'SUCCESS' | 'FAILED'
 * @throws Error if the request fails
 */
export async function checkGsmaTransactionStatus(transactionId: string): Promise<'PENDING' | 'SUCCESS' | 'FAILED'> {
  try {
    const url = `${BASE_URL}/v1/payments/${transactionId}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${API_KEY}`,
    };
    if (USERNAME) headers['Username'] = USERNAME;
    const res = await axios.get(url, { headers });
    /**
     * Response JSON:
     *   {
     *     status: 'pending' | 'success' | 'failed',
     *     ...
     *   }
     */
    const data = res.data as { status: string };
    const status = data.status;
    if (status === 'pending') return 'PENDING';
    if (status === 'success') return 'SUCCESS';
    if (status === 'failed') return 'FAILED';
    throw new Error(`GSMAAdapter: unknown status '${status}' for transaction ${transactionId}`);
  } catch (error: any) {
    throw new Error(
      `GSMAAdapter: failed to check status for transaction ${transactionId}: ${error?.response?.data?.message || error.message}`
    );
  }
}

/**
 * Fetch the current wallet balance for a GSMA provider (if supported).
 *
 * Endpoint: `${GSMA_BASE_URL}/v1/balance?provider={provider}`
 * Method: GET
 * Headers:
 *   - Authorization: Bearer <GSMA_API_KEY>
 *   - Username: <GSMA_USERNAME> (if required)
 *
 * Example response:
 *   {
 *     balance: number
 *   }
 *
 * @param provider - The GSMA provider ('ORANGE' | 'MASCOM' | 'BTC')
 * @returns The wallet balance as a number
 * @throws Error if the request fails
 */
export async function fetchGsmaBalance(provider: 'ORANGE' | 'MASCOM' | 'BTC'): Promise<number> {
  try {
    const url = `${BASE_URL}/v1/balance?provider=${provider}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${API_KEY}`,
    };
    if (USERNAME) headers['Username'] = USERNAME;
    const res = await axios.get(url, { headers });
    /**
     * Response JSON:
     *   {
     *     balance: number
     *   }
     */
    const data = res.data as { balance: number };
    return data.balance;
  } catch (error: any) {
    throw new Error(
      `GSMAAdapter: failed to fetch balance for provider ${provider}: ${error?.response?.data?.message || error.message}`
    );
  }
}
