export interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
}

export function getAIResponse(question: string): ChatMessage {
  if (question.toLowerCase().includes('loan')) {
    return {
      from: 'ai',
      text: 'If you take a 1,000 loan, your risk of overdraft is 6%. Consider paying in 2 installments.',
    };
  }
  return {
    from: 'ai',
    text: 'Sorry, I can only answer money questions for now.',
  };
}

export function simulateExpensesVsIncome(income: number, expenses: number, loan: number): number {
  const projected = income - expenses - loan;
  if (projected < 0) return 80;
  if (projected < income * 0.1) return 40;
  return 6;
}
