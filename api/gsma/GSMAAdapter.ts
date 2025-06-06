import axios from 'axios';
import paymentConfig from '../../config/payment';

// Unified response types for all providers
export interface PaymentInitParams {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: string; // e.g., 'ORANGE', 'MASCOM', 'BTC'
  referenceId: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
  transactionId: string;
  paymentUrl?: string;
  statusUrl?: string;
  provider: string;
}

export interface TransactionStatusResponse {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | string;
  raw?: any;
}

export interface WalletBalanceResponse {
  balance: number;
  currency: string;
  provider: string;
}

// Retry helper
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === retries) throw err;
      await new Promise(res => setTimeout(res, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

/**
 * Initialize a payment with a GSMA-compliant provider (e.g., Orange Money, Cellulant, MFS Africa).
 * Returns transactionId and paymentUrl/statusUrl if available.
 *
 * Response format:
 *   { transactionId, paymentUrl?, statusUrl?, provider }
 */
export async function initializePayment(params: PaymentInitParams): Promise<PaymentInitResponse> {
  const { provider } = params;
  if (provider === 'ORANGE') {
    // Orange Money Botswana logic (migrated from OrangeMoneyConnector)
    return withRetry(async () => {
      // 1. Obtain OAuth token
      const tokenResp = await axios.post(
        paymentConfig.orange.oauthUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${paymentConfig.orange.clientId}:${paymentConfig.orange.clientSecret}`).toString('base64'),
          },
        }
      );
      const tokenData = tokenResp.data as { access_token?: string };
      const accessToken = tokenData.access_token;
      if (!accessToken) throw new Error('Orange Money: failed to obtain token');
      // 2. Initialize transaction
      const resp = await axios.post(
        paymentConfig.orange.baseUrl + '/api/v1/transactions',
        {
          amount: params.amount,
          currency: params.currency,
          subscriber: params.phoneNumber,
          externalTransactionId: params.referenceId,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = resp.data?.data;
      if (!data?.transactionId || !data?.paymentUrl) throw new Error('Orange Money: invalid response');
      return {
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
        provider,
      };
    });
  }
  // Add other providers here (Cellulant, MFS Africa, etc.)
  throw new Error('Provider not supported: ' + provider);
}

/**
 * Check transaction status for a GSMA-compliant provider.
 * Returns status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | ...
 */
export async function checkTransactionStatus(provider: string, transactionId: string): Promise<TransactionStatusResponse> {
  if (provider === 'ORANGE') {
    return withRetry(async () => {
      // 1. Obtain OAuth token
      const tokenResp = await axios.post(
        paymentConfig.orange.oauthUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${paymentConfig.orange.clientId}:${paymentConfig.orange.clientSecret}`).toString('base64'),
          },
        }
      );
      const accessToken = tokenResp.data.access_token;
      if (!accessToken) throw new Error('Orange Money: failed to obtain token');
      // 2. Check status
      const resp = await axios.get(
        paymentConfig.orange.baseUrl + `/api/v1/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const status = resp.data?.data?.status;
      if (!status) throw new Error('Orange Money: missing status');
      return { status, raw: resp.data };
    });
  }
  // Add other providers here
  throw new Error('Provider not supported: ' + provider);
}

/**
 * Fetch wallet balance for a GSMA-compliant provider (if supported).
 * Returns { balance, currency, provider }
 */
export async function fetchWalletBalance(provider: string, phoneNumber: string): Promise<WalletBalanceResponse> {
  // Not implemented for Orange Money (API not public)
  throw new Error('fetchWalletBalance not implemented for provider: ' + provider);
}

// ---
// All errors are thrown as Error objects with clear messages.
// All API keys/secrets are loaded from config/payment.ts (which loads from .env).
// Add new providers by extending the switch logic above.
