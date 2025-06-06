import { supabase } from '../supabaseClient';

export async function resolveRecipientDID(identifier: string) {
  // identifier can be email, phone, or DID
  if (identifier.startsWith('did:')) return identifier;
  const { data: alias } = await supabase
    .from('aliases')
    .select('did')
    .eq('alias_value', identifier)
    .single();
  if (!alias) throw new Error('Recipient not found');
  return alias.did;
}

export async function sendPayment({ fromDid, toIdentifier, amount, channel }: {
  fromDid: string;
  toIdentifier: string;
  amount: number;
  channel: string;
}) {
  const toDid = await resolveRecipientDID(toIdentifier);
  // Insert transaction
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert([{ from_did: fromDid, to_did: toDid, amount, channel, status: 'PENDING' }])
    .select()
    .single();
  if (error) throw error;
  // Simulate payment processing, then update status
  await supabase.from('transactions').update({ status: 'COMPLETED' }).eq('id', tx.id);
  // Ledger events
  await supabase.from('ledger_events').insert([
    { did: fromDid, event_type: 'TRANSFER_OUT', amount: -amount, related_tx: tx.id },
    { did: toDid, event_type: 'TRANSFER_IN', amount, related_tx: tx.id }
  ]);
  return tx;
}
