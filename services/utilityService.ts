import { supabase } from '../supabaseClient';

export async function payUtility({ did, provider, amount, type }: {
  did: string;
  provider: string;
  amount: number;
  type: string;
}) {
  const { data: payment, error } = await supabase
    .from('utility_payments')
    .insert([{ did, provider, amount, type, status: 'COMPLETED' }])
    .select()
    .single();
  if (error) throw error;
  await supabase.from('ledger_events').insert([
    { did, event_type: 'UTILITY_PAYMENT', amount: -amount, related_tx: payment.id }
  ]);
  return payment;
}
