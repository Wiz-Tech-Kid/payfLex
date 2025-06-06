/**
 * CreditScoreServiceAPI.ts
 * Client-side stub for Credit Score Service REST API.
 *
 * Simulates:
 * - GET /creditscore/{did}
 * - POST /creditscore/recalc/{did}
 */

import { computeCreditScore, getCreditScore } from './CreditScoreService';

/**
 * Simulate GET /creditscore/{did} by calling local CreditScoreService.getCreditScore.
 * @param did User's DID
 * @returns Promise<number> Credit score
 */
export async function getCreditScoreAPI(did: string): Promise<number> {
  return getCreditScore(did);
}

/**
 * Simulate POST /creditscore/recalc/{did} by calling local CreditScoreService.computeCreditScore.
 * @param did User's DID
 * @returns Promise<number> New credit score
 */
export async function recalcCreditScore(did: string): Promise<number> {
  return computeCreditScore(did);
}
