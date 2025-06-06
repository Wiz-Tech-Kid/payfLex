/**
 * ChatServiceAPI.ts
 * Client-side stub for AI/Chat Service REST API.
 *
 * Simulates:
 * - POST /chat/financial
 * - GET /chat/history/{did}
 */
import { getChatHistory, sendChatMessage } from './OpenAIService';

/**
 * Simulate POST /chat/financial by calling OpenAIService.sendChatMessage.
 * @param params.did User's DID
 * @param params.message User's message
 * @param params.language 'en' | 'tn' | 'kg'
 * @returns Promise<{ botReply: string }>
 */
export async function sendMessageAPI(params: { did: string; message: string; language: 'en' | 'tn' | 'kg' }): Promise<{ botReply: string }> {
  const botReply = await sendChatMessage(params);
  return { botReply };
}

/**
 * Simulate GET /chat/history/{did} by calling OpenAIService.getChatHistory.
 * @param did User's DID
 * @returns Promise<ChatLog[]> Chat history
 */
export async function fetchChatHistoryAPI(did: string): Promise<any[]> {
  return getChatHistory(did);
}
