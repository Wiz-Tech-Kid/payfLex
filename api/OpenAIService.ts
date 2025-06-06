/**
 * OpenAIService.ts
 * Wraps calls to OpenAI's Chat Completions endpoint for Money Companion.
 *
 * Environment variable: OPENAI_API_KEY
 */

import axios from 'axios';
import { getBalance, getChatLogs, getCreditScore, getFraudScore, getUserLedgerEvents, upsertChatLog } from './SupabaseService';

/**
 * Sends a chat message to OpenAI and logs both user and bot messages in ai_chat_logs table.
 *
 * Endpoint: POST https://api.openai.com/v1/chat/completions
 * Headers: Authorization: Bearer <OPENAI_API_KEY>, Content-Type: application/json
 *
 * @param params.did User DID
 * @param params.message User message
 * @param params.language 'en' | 'tn' | 'kg'
 * @returns Promise<string> Bot reply
 */
export async function sendChatMessage(params: { did: string; message: string; language: 'en' | 'tn' | 'kg' }): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
  const now = new Date().toISOString();
  // Save user message
  await upsertChatLog({ did: params.did, from_role: 'user', message_text: params.message, language: params.language, timestamp: now });
  // Fetch user context
  const balance = await getBalance(params.did);
  const creditScore = await getCreditScore(params.did);
  const fraudScore = await getFraudScore(params.did);
  const recentEvents = await getUserLedgerEvents(params.did, new Date(Date.now() - 30*24*60*60*1000).toISOString());
  const prompt = `You are a financial advisor fluent in ${params.language}. The user (DID=${params.did}) has:\n- Balance: ${balance}\n- Credit Score: ${creditScore}\n- Fraud Score: ${fraudScore}\n- Recent Transactions: ${recentEvents.slice(0,5).map(e=>e.eventType+': P'+e.amount).join(', ')}\n\nThe user asks: \"${params.message}\"\n\nProvide a concise answer in ${params.language}, referencing their data. If it’s a what‐if question, include approximate risk metrics.`;
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'system', content: prompt }],
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  type OpenAIResponse = {
    choices: { message: { content: string } }[];
  };
  const data = resp.data as OpenAIResponse;
  const botReply = data.choices[0].message.content;
  await upsertChatLog({ did: params.did, from_role: 'bot', message_text: botReply, language: params.language, timestamp: new Date().toISOString() });
  return botReply;
}

/**
 * Fetches chat history for a user from ai_chat_logs table.
 * @param did User DID
 * @returns Promise<ChatLog[]> Array of chat logs
 */
export async function getChatHistory(did: string) {
  return getChatLogs(did);
}
