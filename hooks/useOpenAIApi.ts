// hooks/useOpenAIApi.ts
import { useCallback } from 'react';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export function useOpenAIApi() {
  // Returns a function that takes simulation input and returns a suggestion string
  const getOpenAIInsights = useCallback(async (input: any) => {
    if (!OPENAI_API_KEY) return '';
    const prompt = `A user is simulating a loan. Their monthly income is ${input.income}, expenses are ${input.expenses}, and loan amount is ${input.loanAmount}. Give a short, practical financial suggestion for this scenario.`;
    try {
      const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful financial assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 60,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    } catch {
      return '';
    }
  }, []);

  return { getOpenAIInsights };
}
