import { ChatLog, getChatHistory, sendChatMessage } from './AIChatService';

export async function sendMessageAPI(params: { did: string; message: string; language: 'en' | 'tn' | 'kg'; }): Promise<{ botReply: string }> {
  return sendChatMessage(params);
}

export async function fetchChatHistoryAPI(did: string): Promise<ChatLog[]> {
  return getChatHistory(did);
}
