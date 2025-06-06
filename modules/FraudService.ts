/**
 * FraudService.ts
 * Combines internal fraud logic with FraudLabs Pro results.
 *
 * Simulates REST endpoints:
 * - GET /fraud/score/{did}
 * - POST /fraud/check
 */

import { getUserByDid } from './DigitalIdentityLedger';
import { getFraudScore as getInternalFraudScore } from './FraudIntelligence';
import { checkFraudLabsOrder } from './ThirdPartyFraudConnector';

/**
 * Checks fraud score for a user, combining internal and FraudLabs Pro scores.
 * @param params.userDid User's DID
 * @param params.ipAddress Last known IP address
 * @returns {Promise<{ fraudScore: number; isBlocked: boolean }>} Combined fraud score and block status
 */
export async function checkFraud(params: { userDid: string; ipAddress: string; }): Promise<{ fraudScore: number; isBlocked: boolean }> {
  const user = await getUserByDid(params.userDid);
  if (!user) throw new Error('User not found');
  const internalScore = await getInternalFraudScore(params.userDid);
  // For demo, use lastTxnAmount = 100
  const { riskScore } = await checkFraudLabsOrder({
    email: user.email,
    phone: user.phoneNumber,
    ipAddress: params.ipAddress,
    amount: 100,
  });
  const combinedScore = Math.round(internalScore * 0.7 + riskScore * 0.3);
  return { fraudScore: combinedScore, isBlocked: combinedScore > 80 };
}

/**
 * Gets only the internal fraud score for a user.
 * @param userDid User's DID
 * @returns Promise<number>
 */
export async function getFraudScore(userDid: string): Promise<number> {
  return getInternalFraudScore(userDid);
}
