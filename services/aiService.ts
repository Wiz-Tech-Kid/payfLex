import { supabase } from '../supabaseClient';

export async function logAIChat({ did, message, role }: { did: string; message: string; role: 'user' | 'ai' }) {
  await supabase.from('ai_chat_logs').insert([{ did, message, role }]);
}

