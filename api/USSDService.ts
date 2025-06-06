/**
 * USSDService.ts
 * Handles USSD session state and menu navigation for Africa's Talking integration.
 *
 * Environment variables: AFRICASTALKING_API_KEY, AFRICASTALKING_USERNAME
 */
import { recordEventAPI } from './LedgerServiceAPI';
import { getUserByPhone, getUssdSession, upsertUssdSession } from './SupabaseService';
import { sendPayment } from './UnifiedPaymentsService';

/**
 * Handles a USSD request from Africa's Talking, updating session state and returning the next menu or result.
 *
 * @param params.sessionId Unique session ID from Africa's Talking
 * @param params.phoneNumber User's phone number (8 digits)
 * @param params.text String of digits entered so far
 * @returns Promise<{ response: string; keepSession: boolean }>
 */
export async function handleUssdRequest(params: { sessionId: string; phoneNumber: string; text: string }): Promise<{ response: string; keepSession: boolean }> {
  let session = await getUssdSession(params.sessionId);
  if (!session) {
    session = {
      session_id: params.sessionId,
      phone_number: params.phoneNumber,
      current_menu: 'MAIN_MENU',
      temp_data: {},
      initiated_at: new Date().toISOString(),
      last_interaction: new Date().toISOString(),
      is_active: true,
    };
    await upsertUssdSession(session);
  }
  // Main menu logic
  if (params.text === '' || session.current_menu === 'MAIN_MENU') {
    session.current_menu = 'MAIN_MENU';
    await upsertUssdSession(session);
    return { response: '1. Send Money\n2. Check Fraud Score\n3. View Balance\n4. Exit', keepSession: true };
  }
  if (params.text.startsWith('1')) {
    session.current_menu = 'SEND_MONEY_STEP1';
    await upsertUssdSession(session);
    return { response: 'Enter recipient phone or DID:', keepSession: true };
  }
  if (session.current_menu === 'SEND_MONEY_STEP1') {
    session.temp_data.recipient = params.text;
    session.current_menu = 'SEND_MONEY_STEP2';
    await upsertUssdSession(session);
    return { response: 'Enter amount to send:', keepSession: true };
  }
  if (session.current_menu === 'SEND_MONEY_STEP2') {
    const amount = parseFloat(params.text);
    const sender = await getUserByPhone(params.phoneNumber);
    if (!sender) {
      session.is_active = false;
      await upsertUssdSession(session);
      return { response: 'Error: Sender not found.', keepSession: false };
    }
    const didSender = sender.did;
    let toDid: string;
    if (session.temp_data.recipient.startsWith('did:bw:')) {
      toDid = session.temp_data.recipient;
    } else {
      const recipientUser = await getUserByPhone(session.temp_data.recipient);
      if (!recipientUser) {
        session.is_active = false;
        await upsertUssdSession(session);
        return { response: 'Error: Recipient not found.', keepSession: false };
      }
      toDid = recipientUser.did;
    }
    const { success, message } = await sendPayment({ senderDid: didSender, recipientAlias: toDid, amount, channel: 'ussd' });
    if (success) {
      await recordEventAPI({ did: didSender, eventType: 'TRANSFER_OUT', amount, counterpartyDid: toDid, metadata: { channel: 'USSD' } });
      await recordEventAPI({ did: toDid, eventType: 'TRANSFER_IN', amount, counterpartyDid: didSender, metadata: { channel: 'USSD' } });
    }
    session.is_active = false;
    await upsertUssdSession(session);
    return { response: success ? `Success: ${message}` : `Error: ${message}`, keepSession: false };
  }
  if (params.text.startsWith('2')) {
    const user = await getUserByPhone(params.phoneNumber);
    if (!user) {
      session.is_active = false;
      await upsertUssdSession(session);
      return { response: 'Error: User not found.', keepSession: false };
    }
    const did = user.did;
    const fraudScore = await import('./SupabaseService').then(m => m.getFraudScore(did));
    session.is_active = false;
    await upsertUssdSession(session);
    return { response: `Your Fraud Score is ${fraudScore}.`, keepSession: false };
  }
  if (params.text.startsWith('3')) {
    const user = await getUserByPhone(params.phoneNumber);
    if (!user) {
      session.is_active = false;
      await upsertUssdSession(session);
      return { response: 'Error: User not found.', keepSession: false };
    }
    const did = user.did;
    const balance = await import('./SupabaseService').then(m => m.getBalance(did));
    session.is_active = false;
    await upsertUssdSession(session);
    return { response: `Your balance is P ${balance}.`, keepSession: false };
  }
  if (params.text.startsWith('4')) {
    session.is_active = false;
    await upsertUssdSession(session);
    return { response: 'Session ended. Goodbye.', keepSession: false };
  }
  // Fallback
  await upsertUssdSession(session);
  return { response: 'Invalid input. Returning to main menu.', keepSession: true };
}
/**
 * Retrieves the user's balance by DID.
 * @param did The user's DID
 * @returns Promise<number> The user's balance in Pula
 */
export async function getBalance(did: string): Promise<number> {
    // Use the shared supabase client from SupabaseService
    const { supabase } = await import('./SupabaseService');
    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('did', did)
        .single();

    if (error || !data) {
        return 0;
    }
    return Number(data.balance) || 0;
}