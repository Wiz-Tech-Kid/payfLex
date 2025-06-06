/**
 * LedgerServiceAPI.ts
 * Client-side stub for Ledger Service REST API.
 *
 * Simulates:
 * - POST /ledger/record
 * - GET /ledger/user/{did}?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
import { getUserLedgerEvents, recordLedgerEvent } from './SupabaseService';

/**
 * Simulate POST /ledger/record by calling SupabaseService.recordLedgerEvent.
 * @param event Ledger event object
 * @returns Promise<void>
 */
export async function recordEventAPI(event: { did: string; eventType: string; amount: number; counterpartyDid?: string; metadata?: any }): Promise<void> {
  await recordLedgerEvent(event);
}

/**
 * Simulate GET /ledger/user/{did}?from=YYYY-MM-DD&to=YYYY-MM-DD by calling SupabaseService.getUserLedgerEvents.
 * @param params.did User's DID
 * @param params.fromDate ISO string (optional)
 * @param params.toDate ISO string (optional)
 * @returns Promise<LedgerEvent[]> All events for this user
 */
export async function fetchUserLedgerAPI(params: { did: string; fromDate?: string; toDate?: string }): Promise<any[]> {
  return getUserLedgerEvents(params.did, params.fromDate, params.toDate);
}
