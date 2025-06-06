import { supabase } from '../supabaseClient';

export async function getFraudScore(did: string) {
  const { data: score } = await supabase
    .from('fraud_score')
    .select('score')
    .eq('did', did)
    .single();
  return score?.score ?? 0;
}
