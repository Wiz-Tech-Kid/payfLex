// Hook to fetch user balance (mock)
import { useState } from 'react';

export function useBalance() {
  const [balance, setBalance] = useState(1500.0);
  return { balance };
}
