import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { getFraudScore, getUserLedgerEvents } from '../api/SupabaseService';
import { getCreditScore } from './CreditScoreService';

const CHAT_LOG_FILE = FileSystem.documentDirectory + 'ai_chat_logs.json';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatLog {
  from_role: 'user' | 'bot';
  message_text: string;
  language: 'en' | 'tn' | 'kg';
  timestamp: string;
}


interface LedgerEvent {
  eventId: number;
  did: string;
  eventType: string;
  amount: number;
  counterpartyDid?: string;
  metadata?: any;
  timestamp: string;
  createdAt: string;
}

export async function sendChatMessage(params: { did: string; message: string; language: 'en' | 'tn' | 'kg'; }): Promise<{ botReply: string }> {
  const now = new Date().toISOString();
  let logs: ChatLog[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(CHAT_LOG_FILE);
    logs = JSON.parse(content);
  } catch {
    logs = [];
  }
  logs.push({ from_role: 'user', message_text: params.message, language: params.language, timestamp: now });
  await FileSystem.writeAsStringAsync(CHAT_LOG_FILE, JSON.stringify(logs, null, 2));

  const balance = 0; // getBalance is not implemented, so use 0 or fetch from another source if available
  const creditScore = await getCreditScore(params.did);
  const fraudScore = await getFraudScore(params.did);
  const ledger = (await getUserLedgerEvents(params.did)) as LedgerEvent[];
  const recentEvents = ledger.slice(0, 5).map(e => `${e.timestamp.slice(0,10)}: ${e.eventType} P${e.amount}${e.counterpartyDid ? ' → ' + e.counterpartyDid : ''}`).join('\n');
  const prompt = `You are a financial advisor fluent in ${params.language}. Use the user's DID to fetch their account summary:\n- Balance: ${balance}\n- Credit Score: ${creditScore}\n- Fraud Score: ${fraudScore}\n- Recent spending: ${recentEvents}\n\nThe user says: \"${params.message}\"\n\nProvide a concise advice in ${params.language}, referencing their balance and risk. If they ask what-if questions, you can include rough simulation results.`;

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
  const data = resp.data as { choices?: { message: { content: string } }[] };
  const botReply = data.choices?.[0]?.message?.content || 'Sorry, I could not answer your question.';
  logs.push({ from_role: 'bot', message_text: botReply, language: params.language, timestamp: new Date().toISOString() });
  await FileSystem.writeAsStringAsync(CHAT_LOG_FILE, JSON.stringify(logs, null, 2));
  return { botReply };
}

export async function getChatHistory(did: string): Promise<ChatLog[]> {
  let logs: ChatLog[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(CHAT_LOG_FILE);
    logs = JSON.parse(content);
  } catch {
    return [];
  }
  return logs.filter(l => true).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
