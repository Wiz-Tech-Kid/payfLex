/**
 * UnifiedPaymentsService.ts
 * Coordinates between payment channels, fraud checks, and ledger/transaction recording.
 *
 * Exposes:
 * - sendPayment: POST /transactions/send
 */
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { checkFraud } from './FraudService';
import { recordEventAPI } from './LedgerServiceAPI';
import { initializeOrangeTransaction } from './OrangeMoneyConnector';
import { createTransaction, getAliasByValue } from './SupabaseService';

/**
 * Sends a payment, performing fraud checks and channel-specific logic.
 *
 * @param params.senderDid Sender's DID
 * @param params.recipientAlias Recipient alias (phone, email, or DID)
 * @param params.amount Amount to send
 * @param params.channel Payment channel
 * @returns Promise<{ success: boolean; message: string }>
 *
 * Simulates POST /transactions/send
 */
export async function sendPayment(params: { senderDid: string; recipientAlias: string; amount: number; channel: 'bank' | 'wallet' | 'qr' | 'orange_money' | 'ussd' }): Promise<{ success: boolean; message: string }> {
  if (params.amount <= 0) return { success: false, message: 'Amount must be greater than zero.' };
  // TODO: get real IP
  const fraudCheck = await checkFraud({ did: params.senderDid, ipAddress: '197.234.56.78' });
  if (fraudCheck.isBlocked) return { success: false, message: 'Transfer blocked due to high fraud risk.' };
  let recipientDid = params.recipientAlias;
  if (!recipientDid.startsWith('did:bw:')) {
    const alias = await getAliasByValue('phone', params.recipientAlias);
    if (!alias) return { success: false, message: 'Recipient not found.' };
    recipientDid = alias.did;
  }
  if (params.channel === 'orange_money') {
    const { transactionId, paymentUrl } = await initializeOrangeTransaction({ amount: params.amount, currency: 'BWP', subscriberPhone: params.recipientAlias, referenceId: uuidv4() });
    await createTransaction({ from_did: params.senderDid, to_did: recipientDid, amount: params.amount, fee_amount: 0, channel: 'ORANGE', status: 'PENDING', initiated_at: new Date().toISOString(), alias_used: params.recipientAlias });
    return { success: true, message: 'Please complete payment at: ' + paymentUrl };
  } else {
    await createTransaction({ from_did: params.senderDid, to_did: recipientDid, amount: params.amount, fee_amount: 0, channel: params.channel.toUpperCase(), status: 'COMPLETED', initiated_at: new Date().toISOString(), completed_at: new Date().toISOString(), alias_used: params.recipientAlias });
    await recordEventAPI({ did: params.senderDid, eventType: 'TRANSFER_OUT', amount: params.amount, counterpartyDid: recipientDid, metadata: { channel: params.channel } });
    await recordEventAPI({ did: recipientDid, eventType: 'TRANSFER_IN', amount: params.amount, counterpartyDid: params.senderDid, metadata: { channel: params.channel } });
    return { success: true, message: 'Transfer complete.' };
  }
}
