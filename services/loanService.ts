import { supabase } from '../supabaseClient';

export async function applyForLoan({ did, amount, term, interestRate }: {
  did: string;
  amount: number;
  term: number;
  interestRate: number;
}) {
  const { data: app, error } = await supabase
    .from('loan_applications')
    .insert([{ did, amount, term, interest_rate: interestRate, status: 'PENDING' }])
    .select()
    .single();
  if (error) throw error;
  return app;
}
