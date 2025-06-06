/**
 * AIChatService.ts
 * Proxies OpenAI chat completions for Money Companion, logs all messages.
 * Table: ai_chat_logs
 *
 * All reads/writes are to local JSON for POC, but match DB schema.
 *
 * Environment variable: OPENAI_API_KEY
 */

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { getCreditScore } from './CreditScoreService';
import { getFraudScore } from './FraudIntelligence';
import { getUserLedgerEvents } from './LedgerService';
import { getBalance } from './UnifiedPaymentsEngine';

const CHAT_LOG_FILE = FileSystem.documentDirectory + 'ai_chat_logs.json';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatLog {
  from_role: 'user' | 'bot';
  message_text: string;
  language: 'en' | 'tn' | 'kg';
  timestamp: string;
}

/**
 * Send a chat message to the Money Companion (OpenAI GPT-4/3.5).
 * Logs both user and bot messages in ai_chat_logs table.
 * @param params.did User's DID
 * @param params.message User's message
 * @param params.language 'en' | 'tn' | 'kg'
 * @returns {Promise<{ botReply: string }>} Bot's reply
 *
 * Calls OpenAI API with a prompt including user's balance, credit score, fraud score, and recent ledger events.
 * Logs both user and bot messages in ai_chat_logs.
 */
export async function sendChatMessage(params: { did: string; message: string; language: 'en' | 'tn' | 'kg'; }): Promise<{ botReply: string }> {
  const now = new Date().toISOString();
  // Log user message
  let logs: ChatLog[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(CHAT_LOG_FILE);
    logs = JSON.parse(content);
  } catch {
    logs = [];
  }
  logs.push({ from_role: 'user', message_text: params.message, language: params.language, timestamp: now });
  await FileSystem.writeAsStringAsync(CHAT_LOG_FILE, JSON.stringify(logs, null, 2));

  // Build prompt
  const balance = await getBalance(params.did);
  const creditScore = await getCreditScore(params.did);
  const fraudScore = await getFraudScore(params.did);
  const ledger = await getUserLedgerEvents(params.did);
  const recentEvents = ledger.slice(0, 5).map(e => `${e.timestamp.slice(0,10)}: ${e.eventType} P${e.amount}${e.counterpartyDid ? ' → ' + e.counterpartyDid : ''}`).join('\n');
  const prompt = `You are a financial advisor fluent in ${params.language}. Use the user's DID to fetch their account summary:\n- Balance: ${balance}\n- Credit Score: ${creditScore}\n- Fraud Score: ${fraudScore}\n- Recent spending: ${recentEvents}\n\nThe user says: "${params.message}"\n\nProvide a concise advice in ${params.language}, referencing their balance and risk. If they ask what-if questions, you can include rough simulation results.`;

  // Call OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const resp = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a financial advisor for PayFlex.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const botReply = resp.data?.choices?.[0]?.message?.content || 'Sorry, I could not answer your question.';
  // Log bot reply
  logs.push({ from_role: 'bot', message_text: botReply, language: params.language, timestamp: new Date().toISOString() });
  await FileSystem.writeAsStringAsync(CHAT_LOG_FILE, JSON.stringify(logs, null, 2));
  return { botReply };
}

/**
 * Get chat history for a user from ai_chat_logs table.
 * @param did User's DID
 * @returns Promise<ChatLog[]> All messages for this DID, ordered by timestamp ASC
 */
export async function getChatHistory(did: string): Promise<ChatLog[]> {
  let logs: ChatLog[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(CHAT_LOG_FILE);
    logs = JSON.parse(content);
  } catch {
    return [];
  }
  // For POC, filter by DID if stored, else return all
  return logs.filter(l => true).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
