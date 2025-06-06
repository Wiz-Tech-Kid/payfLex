import { supabase } from '../supabaseClient';

export async function startUSSDSession({ phone }: { phone: string }) {
  const { data: session, error } = await supabase
    .from('ussd_sessions')
    .insert([{ phone_number: phone, is_active: true }])
    .select()
    .single();
  if (error) throw error;
  return session;
}
