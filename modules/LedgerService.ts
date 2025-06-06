/**
 * LedgerService.ts
 * Handles recording and fetching ledger events for PayFlex.
 *
 * Tables: ledger_events, utility_payments, merchant_fees
 *
 * All writes/reads are to local JSON for POC, but match the DB schema.
 */

import * as FileSystem from 'expo-file-system';

const LEDGER_FILE = FileSystem.documentDirectory + 'ledger_events.json';
const UTILITY_FILE = FileSystem.documentDirectory + 'utility_payments.json';
const MERCHANT_FEES_FILE = FileSystem.documentDirectory + 'merchant_fees.json';

export type LedgerEventType =
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'UTILITY_PAYMENT'
  | 'LOAN_DISBURSE'
  | 'LOAN_REPAYMENT'
  | 'MERCHANT_FEE'
  | 'DISBURSEMENT';

export interface LedgerEvent {
  eventId: number;
  did: string;
  eventType: LedgerEventType;
  amount: number;
  counterpartyDid?: string;
  metadata?: any;
  timestamp: string;
  createdAt: string;
}

/**
 * Record a new ledger event in ledger_events table (JSON for POC).
 * If eventType is UTILITY_PAYMENT, also insert into utility_payments.
 * If eventType is MERCHANT_FEE, also insert into merchant_fees.
 * @param params.did User's DID
 * @param params.eventType Event type (see LedgerEventType)
 * @param params.amount Amount
 * @param params.counterpartyDid Counterparty DID (optional)
 * @param params.metadata Extra metadata (e.g., { channel: 'USSD' })
 * @param params.timestamp Optional timestamp (default now)
 * @returns Promise<void>
 */
export async function recordLedgerEvent(params: {
  did: string;
  eventType: LedgerEventType;
  amount: number;
  counterpartyDid?: string;
  metadata?: any;
  timestamp?: string;
}): Promise<void> {
  const now = params.timestamp || new Date().toISOString();
  let ledger: LedgerEvent[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(LEDGER_FILE);
    ledger = JSON.parse(content);
  } catch {
    ledger = [];
  }
  const eventId = ledger.length > 0 ? ledger[ledger.length - 1].eventId + 1 : 1;
  const event: LedgerEvent = {
    eventId,
    did: params.did,
    eventType: params.eventType,
    amount: params.amount,
    counterpartyDid: params.counterpartyDid,
    metadata: params.metadata,
    timestamp: now,
    createdAt: now,
  };
  ledger.push(event);
  await FileSystem.writeAsStringAsync(LEDGER_FILE, JSON.stringify(ledger, null, 2));

  if (params.eventType === 'UTILITY_PAYMENT') {
    let utility: any[] = [];
    try {
      const content = await FileSystem.readAsStringAsync(UTILITY_FILE);
      utility = JSON.parse(content);
    } catch {
      utility = [];
    }
    utility.push({
      utilityId: 'util_' + eventId,
      did: params.did,
      provider: params.metadata?.utilityName || '',
      paymentAmount: params.amount,
      paymentType: params.metadata?.paymentType || 'BILL_PAYMENT',
      transactionRef: params.metadata?.transactionRef || '',
      paymentTime: now,
      location: params.metadata?.location || '',
      createdAt: now,
    });
    await FileSystem.writeAsStringAsync(UTILITY_FILE, JSON.stringify(utility, null, 2));
  }
  if (params.eventType === 'MERCHANT_FEE') {
    let fees: any[] = [];
    try {
      const content = await FileSystem.readAsStringAsync(MERCHANT_FEES_FILE);
      fees = JSON.parse(content);
    } catch {
      fees = [];
    }
    fees.push({
      feeId: 'fee_' + eventId,
      merchantDid: params.did,
      txnId: params.metadata?.txnId || '',
      feeAmount: params.amount,
      paidOut: false,
      createdAt: now,
    });
    await FileSystem.writeAsStringAsync(MERCHANT_FEES_FILE, JSON.stringify(fees, null, 2));
  }
}

/**
 * Fetch all ledger events for a user, optionally filtered by date range.
 * @param did User's DID
 * @param fromDate ISO string (optional)
 * @param toDate ISO string (optional)
 * @returns Promise<LedgerEvent[]> Sorted by timestamp DESC
 */
export async function getUserLedgerEvents(did: string, fromDate?: string, toDate?: string): Promise<LedgerEvent[]> {
  let ledger: LedgerEvent[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(LEDGER_FILE);
    ledger = JSON.parse(content);
  } catch {
    return [];
  }
  let filtered = ledger.filter(e => e.did === did);
  if (fromDate) filtered = filtered.filter(e => e.timestamp >= fromDate);
  if (toDate) filtered = filtered.filter(e => e.timestamp <= toDate);
  return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
