import { supabase } from '../supabaseClient';

export async function logAIChat({ did, message, role }: { did: string; message: string; role: 'user' | 'ai' }) {
  await supabase.from('ai_chat_logs').insert([{ did, message, role }]);
}

// You can add a function to fetch AI response from your backend or OpenAI API as needed.
