/**
 * FraudService.ts
 * Combines internal fraud logic with FraudLabs Pro results.
 *
 * Exposes:
 * - checkFraud: POST /fraud/check
 * - getFraudScore: GET /fraud/score/{did}
 */
import { checkFraudLabsOrder } from './FraudLabsConnector';
import { getFraudScore as getInternalFraudScore, getUserByDid } from './SupabaseService';

/**
 * Checks fraud score for a user, combining internal and FraudLabs Pro scores.
 *
 * @param params.did User DID
 * @param params.ipAddress Last known IP address
 * @returns {Promise<{ fraudScore: number; isBlocked: boolean }>}
 *
 * Simulates POST /fraud/check
 */
export async function checkFraud(params: { did: string; ipAddress: string }): Promise<{ fraudScore: number; isBlocked: boolean }> {
  const user = await getUserByDid(params.did);
  if (!user) throw new Error('User not found');
  const internalScore = await getInternalFraudScore(params.did);
  // For demo, use lastTxnAmount = 100
  const { riskScore } = await checkFraudLabsOrder({
    email: user.email,
    phone: user.phone_number,
    ipAddress: params.ipAddress,
    amount: 100,
  });
  const compositeScore = Math.round(internalScore * 0.7 + riskScore * 0.3);
  // Upsert fraud_score in Supabase
  await import('./SupabaseService').then(m => m.upsertFraudScore(params.did, compositeScore));
  return { fraudScore: compositeScore, isBlocked: compositeScore > 80 };
}

/**
 * Gets only the internal fraud score for a user.
 *
 * @param did User DID
 * @returns Promise<number>
 *
 * Simulates GET /fraud/score/{did}
 */
export async function getFraudScore(did: string): Promise<number> {
  return getInternalFraudScore(did);
}
