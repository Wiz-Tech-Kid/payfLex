// Real-Time Fraud Intelligence logic for PayFlex
// Assigns fraudScore, blocks/delays transactions, and alerts users

export interface FraudSignal {
  simSwap: boolean;
  frequentTransfers: boolean;
  duplicateLogins: boolean;
}

export function calculateFraudScore(signals: FraudSignal): number {
  let score = 0;
  if (signals.simSwap) score += 40;
  if (signals.frequentTransfers) score += 30;
  if (signals.duplicateLogins) score += 30;
  return score;
}

export function isFraudulent(score: number, threshold = 70): boolean {
  return score > threshold;
}

export function getFraudAlert(score: number): string | null {
  if (score > 70) return 'Your account is flagged for suspicious activity. Please verify your identity.';
  return null;
}
