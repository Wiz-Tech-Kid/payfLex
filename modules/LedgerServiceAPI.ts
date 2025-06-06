/**
 * LedgerServiceAPI.ts
 * Client-side stub for Ledger Service REST API.
 *
 * Simulates:
 * - POST /ledger/record
 * - GET /ledger/user/{did}?from=YYYY-MM-DD&to=YYYY-MM-DD
 */

import { getUserLedgerEvents, LedgerEvent, LedgerEventType, recordLedgerEvent } from './LedgerService';

/**
 * Simulate POST /ledger/record by calling local LedgerService.recordLedgerEvent.
 * @param params.did User's DID
 * @param params.eventType Event type
 * @param params.amount Amount
 * @param params.counterpartyDid Counterparty DID (optional)
 * @param params.metadata Metadata (optional)
 * @returns Promise<void>
 */
export async function recordEvent(params: { did: string; eventType: LedgerEventType; amount: number; counterpartyDid?: string; metadata?: any; }): Promise<void> {
  await recordLedgerEvent(params);
}

/**
 * Simulate GET /ledger/user/{did}?from=YYYY-MM-DD&to=YYYY-MM-DD by calling local LedgerService.getUserLedgerEvents.
 * @param did User's DID
 * @param fromDate ISO string (optional)
 * @param toDate ISO string (optional)
 * @returns Promise<LedgerEvent[]> All events for this user
 */
export async function fetchUserLedger(did: string, fromDate?: string, toDate?: string): Promise<LedgerEvent[]> {
  return getUserLedgerEvents(did, fromDate, toDate);
}
