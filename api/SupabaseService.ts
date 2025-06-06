/**
 * SupabaseService.ts
 * Encapsulates all Supabase CRUD operations for PayFlex tables.
 *
 * Environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Types ---
export interface UserRecord {
  did: string;
  full_name: string;
  email: string;
  phone_number: string;
  omang_id: string;
  gender: 'Male' | 'Female';
  password_hash: string;
  created_at: string;
}
export interface LedgerEvent { /* ...define as per schema... */ }  
export interface Transaction { /* ...define as per schema... */ }  
export interface UtilityPayment { /* ...define as per schema... */ }  
export interface ChatLog { /* ...define as per schema... */ }  
// ...other types as needed...

/**
 * Get a user by DID from 'users' table.
 * @param did
 * @returns Promise<UserRecord | null>
 * Example: supabase.from('users').select('*').eq('did', did)
 */
export async function getUserByDid(did: string): Promise<UserRecord | null> {
  const { data } = await supabase.from('users').select('*').eq('did', did).single();
  return data || null;
}

/**
 * Create a new user in 'users' table.
 * @param user Partial<UserRecord>
 * @returns Promise<void>
 */
export async function createUser(user: Partial<UserRecord>): Promise<void> {
  await supabase.from('users').insert([user]);
}

/**
 * Get alias by value from 'aliases' table.
 * @param aliasType
 * @param aliasValue
 * @returns Promise<{ did: string } | null>
 */
export async function getAliasByValue(aliasType: string, aliasValue: string): Promise<{ did: string } | null> {
  const { data } = await supabase.from('aliases').select('did').eq('alias_type', aliasType).eq('alias_value', aliasValue).single();
  return data || null;
}

/**
 * Upsert a credit score in 'credit_score' table.
 * @param did
 * @param score
 * @returns Promise<void>
 */
export async function upsertCreditScore(did: string, score: number): Promise<void> {
  await supabase.from('credit_score').upsert([{ did, score, last_updated: new Date().toISOString() }], { onConflict: 'did' });
}

/**
 * Get a user's credit score from 'credit_score' table.
 * @param did
 * @returns Promise<number>
 */
export async function getCreditScore(did: string): Promise<number> {
  const { data } = await supabase.from('credit_score').select('score').eq('did', did).single();
  return data?.score ?? 0;
}

/**
 * Upsert a fraud score in 'fraud_score' table.
 * @param did
 * @param score
 * @returns Promise<void>
 */
export async function upsertFraudScore(did: string, score: number): Promise<void> {
  await supabase.from('fraud_score').upsert([{ did, score, last_updated: new Date().toISOString() }], { onConflict: 'did' });
}

/**
 * Get a user's fraud score from 'fraud_score' table.
 * @param did
 * @returns Promise<number>
 */
export async function getFraudScore(did: string): Promise<number> {
  const { data } = await supabase.from('fraud_score').select('score').eq('did', did).single();
  return data?.score ?? 0;
}

/**
 * Record a ledger event in 'ledger_events' table.
 * @param event LedgerEvent
 * @returns Promise<void>
 */
export async function recordLedgerEvent(event: LedgerEvent): Promise<void> {
  await supabase.from('ledger_events').insert([event]);
}

/**
 * Get all ledger events for a user from 'ledger_events' table.
 * @param did
 * @param fromDate
 * @param toDate
 * @returns Promise<LedgerEvent[]>
 */
export async function getUserLedgerEvents(did: string, fromDate?: string, toDate?: string): Promise<LedgerEvent[]> {
  let query = supabase.from('ledger_events').select('*').eq('did', did);
  if (fromDate) query = query.gte('timestamp', fromDate);
  if (toDate) query = query.lte('timestamp', toDate);
  const { data } = await query.order('timestamp', { ascending: false });
  return data || [];
}

/**
 * Get a user by phone number from 'users' table.
 * @param phoneNumber
 * @returns Promise<UserRecord | null>
 */
export async function getUserByPhone(phoneNumber: string): Promise<UserRecord | null> {
  const { data } = await supabase.from('users').select('*').eq('phone_number', phoneNumber).single();
  return data || null;
}

/**
 * Get a USSD session by session_id from 'ussd_sessions' table.
 * @param sessionId
 * @returns Promise<any | null>
 */
export async function getUssdSession(sessionId: string): Promise<any | null> {
  const { data } = await supabase.from('ussd_sessions').select('*').eq('session_id', sessionId).single();
  return data || null;
}

/**
 * Upsert a USSD session in 'ussd_sessions' table.
 * @param session
 * @returns Promise<void>
 */
export async function upsertUssdSession(session: any): Promise<void> {
  await supabase.from('ussd_sessions').upsert([session], { onConflict: 'session_id' });
}

export function getBalance(did: any): any {
    throw new Error('Function not implemented.');
}
// ...add similar CRUD for transactions, utility_payments, merchant_fees, loan_applications, loan_repayments, ai_chat_logs, simulation_requests, ussd_sessions, messages_queue, audit_logs...
