/**
 * USSDService.ts
 * Handles USSD session state and menu navigation for Africa's Talking integration.
 * Table: ussd_sessions
 *
 * All reads/writes are to local JSON for POC, but match DB schema.
 *
 * Africa's Talking USSD callback JSON:
 * {
 *   "sessionId": "b57c918e-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *   "phoneNumber": "77123456",
 *   "text": "<digits so far>"
 * }
 */

import * as FileSystem from 'expo-file-system';
import { getUserByPhone } from './DigitalIdentityLedger';
import { getFraudScore } from './FraudIntelligence';
import { recordLedgerEvent } from './LedgerService';
import { getBalance, sendPayment } from './UnifiedPaymentsEngine';

const USSD_FILE = FileSystem.documentDirectory + 'ussd_sessions.json';

/**
 * Handles a USSD request from Africa's Talking, updating session state and returning the next menu or result.
 * @param params.sessionId Unique session ID from Africa's Talking
 * @param params.phoneNumber User's phone number (8 digits)
 * @param params.text String of digits entered so far
 * @returns Promise<string> USSD response string
 */
export async function handleUssdRequest(params: { sessionId: string; phoneNumber: string; text: string; }): Promise<string> {
  let sessions: any[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(USSD_FILE);
    sessions = JSON.parse(content);
  } catch {
    sessions = [];
  }
  let session = sessions.find(s => s.sessionId === params.sessionId);
  if (!session) {
    session = {
      sessionId: params.sessionId,
      phoneNumber: params.phoneNumber,
      currentMenu: '',
      tempData: {},
      initiatedAt: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      isActive: true,
    };
    sessions.push(session);
  }
  session.lastInteraction = new Date().toISOString();
  if (!session.isActive) return 'Session ended.';

  // Main menu
  if (params.text === '') {
    session.currentMenu = 'MAIN';
    await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
    return '1. Send Money\n2. Check Fraud Score\n3. View Balance\n4. Exit';
  }
  const parts = params.text.split('*');
  if (parts[0] === '1') {
    // Send Money flow
    if (session.currentMenu === 'MAIN' || session.currentMenu === '') {
      session.currentMenu = 'SEND_MONEY_STEP1';
      await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
      return 'Enter recipient phone or DID:';
    }
    if (session.currentMenu === 'SEND_MONEY_STEP1') {
      session.tempData.recipient = parts[1];
      session.currentMenu = 'SEND_MONEY_STEP2';
      await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
      return 'Enter amount to send:';
    }
    if (session.currentMenu === 'SEND_MONEY_STEP2') {
      if (parts[2] === '0' || parts[2] === '*') {
        session.isActive = false;
        await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
        return 'Transaction canceled. Goodbye.';
      }
      const amount = parseFloat(parts[2]);
      try {
        const sender = await getUserByPhone(params.phoneNumber);
        const didSender = sender.did;
        let toDid = session.tempData.recipient;
        if (!toDid.startsWith('did:bw:')) {
          const rec = await getUserByPhone(toDid);
          toDid = rec.did;
        }
        const { success, message } = await sendPayment({ fromUserId: didSender, toUserId: toDid, amount, channel: 'ussd' });
        if (success) {
          await recordLedgerEvent({ did: didSender, eventType: 'TRANSFER_OUT', amount, counterpartyDid: toDid, metadata: { channel: 'USSD' } });
          await recordLedgerEvent({ did: toDid, eventType: 'TRANSFER_IN', amount, counterpartyDid: didSender, metadata: { channel: 'USSD' } });
        }
        session.isActive = false;
        await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
        return (success ? 'Success: ' : 'Error: ') + message;
      } catch (e: any) {
        session.isActive = false;
        await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
        return 'Error: ' + e.message;
      }
    }
  }
  if (parts[0] === '2') {
    // Check Fraud Score
    try {
      const user = await getUserByPhone(params.phoneNumber);
      const fraudScore = await getFraudScore(user.did);
      session.isActive = false;
      await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
      return `Your Fraud Score is ${fraudScore}.`;
    } catch (e: any) {
      session.isActive = false;
      await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
      return 'Error: ' + e.message;
    }
  }
  if (parts[0] === '3') {
    // View Balance
    try {
      const user = await getUserByPhone(params.phoneNumber);
      const balance = await getBalance(user.did);
      session.isActive = false;
      await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
      return `Your balance is P ${balance}.`;
    } catch (e: any) {
      session.isActive = false;
      await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
      return 'Error: ' + e.message;
    }
  }
  if (parts[0] === '4') {
    session.isActive = false;
    await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
    return 'Goodbye.';
  }
  await FileSystem.writeAsStringAsync(USSD_FILE, JSON.stringify(sessions, null, 2));
  return 'Invalid option.';
}

/**
 * Get a user by phone number from users table.
 * @param phoneNumber 8-digit phone
 * @returns Promise<UserRecord>
 * @throws Error if not found
 */
export async function getUserByPhone(phoneNumber: string) {
  // Reuse DigitalIdentityLedger.getUserByPhone
  return await getUserByPhone(phoneNumber);
}
