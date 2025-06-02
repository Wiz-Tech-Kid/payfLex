// Hook to fetch simulation result (mock)
import { useState } from 'react';
import { SimulationResult } from '../modules/FinancialTwinSimulator';

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  return { result };
}
