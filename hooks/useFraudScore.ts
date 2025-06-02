// Hook to fetch fraud score (mock)
import { useState } from 'react';

export function useFraudScore() {
  const [fraudScore, setFraudScore] = useState(20);
  return { fraudScore };
}
