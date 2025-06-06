/**
 * ChatServiceAPI.ts
 * Client-side stub for AI/Chat Service REST API.
 *
 * Simulates:
 * - POST /chat/financial
 * - GET /chat/history/{did}
 */

import { ChatLog, getChatHistory, sendChatMessage } from './AIChatService';

/**
 * Simulate POST /chat/financial by calling local AIChatService.sendChatMessage.
 * @param params.did User's DID
 * @param params.message User's message
 * @param params.language 'en' | 'tn' | 'kg'
 * @returns Promise<{ botReply: string }>
 */
export async function sendMessageAPI(params: { did: string; message: string; language: 'en' | 'tn' | 'kg'; }): Promise<{ botReply: string }> {
  return sendChatMessage(params);
}

/**
 * Simulate GET /chat/history/{did} by calling local AIChatService.getChatHistory.
 * @param did User's DID
 * @returns Promise<ChatLog[]> Chat history
 */
export async function fetchChatHistoryAPI(did: string): Promise<ChatLog[]> {
  return getChatHistory(did);
}
