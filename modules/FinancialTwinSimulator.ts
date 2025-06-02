// Financial Twin Simulator logic for PayFlex
// Simulates loan/purchase scenarios and cash flow

export interface SimulationInput {
  income: number;
  expenses: number;
  loanAmount: number;
  months: number;
  interestRate: number;
}

export interface SimulationResult {
  monthlyRepayment: number;
  totalRepayment: number;
  overdraftRisk: number; // %
  bestCase: number;
  worstCase: number;
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const monthlyRate = input.interestRate / 12 / 100;
  const monthlyRepayment = input.loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -input.months));
  const totalRepayment = monthlyRepayment * input.months;
  const overdraftRisk = input.income - input.expenses - monthlyRepayment < 0 ? 60 : 10;
  return {
    monthlyRepayment: +monthlyRepayment.toFixed(2),
    totalRepayment: +totalRepayment.toFixed(2),
    overdraftRisk,
    bestCase: input.income - input.expenses,
    worstCase: input.income - input.expenses - monthlyRepayment,
  };
}
