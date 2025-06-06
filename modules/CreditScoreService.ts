/**
 * CreditScoreService.ts
 * Computes and retrieves credit scores for users based on ledger_events.
 * Table: credit_score, ledger_events
 *
 * All reads/writes are to local JSON for POC, but match DB schema.
 */

import * as FileSystem from 'expo-file-system';
import { getUserLedgerEvents } from './LedgerService';

const CREDIT_SCORE_FILE = FileSystem.documentDirectory + 'credit_score.json';

/**
 * Compute a user's credit score based on last 12 months of ledger_events.
 * @param did User's DID
 * @returns Promise<number> Credit score (300-850)
 * @throws Error if unable to compute
 *
 * Rules:
 * - UTILITY_PAYMENT: +10 if paidOnTime, -20 if >14 days late
 * - LOAN_REPAYMENT: +15 if amount >= scheduled, -30 if late/missed
 * - TRANSFER_IN: +5 if amount >= 300 and occurs 3 consecutive months
 */
export async function computeCreditScore(did: string): Promise<number> {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate()).toISOString();
  const events = await getUserLedgerEvents(did, twelveMonthsAgo);
  let score = 500;
  let transferInMonths: Record<string, boolean> = {};
  for (const e of events) {
    if (e.eventType === 'UTILITY_PAYMENT') {
      if (e.metadata?.paidOnTime === true) score += 10;
      if (e.metadata?.paidOnTime === false && e.metadata?.daysLate > 14) score -= 20;
    }
    if (e.eventType === 'LOAN_REPAYMENT') {
      if (e.metadata?.amount >= e.metadata?.scheduledRepayment) score += 15;
      if (e.metadata?.late === true || e.metadata?.missed === true) score -= 30;
    }
    if (e.eventType === 'TRANSFER_IN' && e.amount >= 300) {
      const month = e.timestamp.slice(0, 7);
      transferInMonths[month] = true;
    }
  }
  // +5 if 3 consecutive months with TRANSFER_IN >= 300
  const months = Object.keys(transferInMonths).sort();
  let streak = 0;
  for (let i = 1; i < months.length; i++) {
    const prev = new Date(months[i - 1] + '-01');
    const curr = new Date(months[i] + '-01');
    if ((curr.getFullYear() === prev.getFullYear() && curr.getMonth() - prev.getMonth() === 1) ||
        (curr.getFullYear() - prev.getFullYear() === 1 && prev.getMonth() === 11 && curr.getMonth() === 0)) {
      streak++;
      if (streak >= 2) score += 5;
    } else {
      streak = 0;
    }
  }
  score = Math.max(300, Math.min(850, score));
  // Write to credit_score table
  let scores: any[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(CREDIT_SCORE_FILE);
    scores = JSON.parse(content);
  } catch {
    scores = [];
  }
  const idx = scores.findIndex((s: any) => s.did === did);
  const nowStr = new Date().toISOString();
  if (idx >= 0) {
    scores[idx] = { did, score, lastUpdated: nowStr };
  } else {
    scores.push({ did, score, lastUpdated: nowStr });
  }
  await FileSystem.writeAsStringAsync(CREDIT_SCORE_FILE, JSON.stringify(scores, null, 2));
  return score;
}

/**
 * Get a user's credit score from credit_score table, or compute if missing.
 * @param did User's DID
 * @returns Promise<number> Credit score
 */
export async function getCreditScore(did: string): Promise<number> {
  let scores: any[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(CREDIT_SCORE_FILE);
    scores = JSON.parse(content);
  } catch {
    scores = [];
  }
  const found = scores.find((s: any) => s.did === did);
  if (found) return found.score;
  return computeCreditScore(did);
}
