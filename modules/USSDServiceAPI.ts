/**
 * USSDServiceAPI.ts
 * Client-side stub for USSD Service REST API.
 *
 * Simulates:
 * - POST /ussd
 */

import { handleUssdRequest } from './USSDService';

/**
 * Simulate POST /ussd by calling local USSDService.handleUssdRequest.
 * @param params.sessionId Africa's Talking sessionId
 * @param params.phoneNumber User's phone number
 * @param params.text USSD text so far
 * @returns Promise<{ response: string; keepSession: boolean }>
 */
export async function sendUssdRequestAPI(params: { sessionId: string; phoneNumber: string; text: string; }): Promise<{ response: string; keepSession: boolean }> {
  const response = await handleUssdRequest(params);
  // For demo, keepSession = response does not end with 'Goodbye.'
  const keepSession = !/Goodbye\.|Session ended\.|Error:/.test(response);
  return { response, keepSession };
}
