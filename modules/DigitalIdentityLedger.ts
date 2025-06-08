import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * User record for the digital identity ledger.
 */
export interface UserRecord {
  userHash: string;
  did: string; 
  fullName: string;
  email: string;
  phone_number: string;
  omangID: string;
  gender: "Male" | "Female";
  passwordHash: string;
  createdAt: string;
}

const USERS_FILE = FileSystem.documentDirectory + 'users.json';
const SECRET_KEY = 'SUPER_SECRET_KEY';

/**
 * Compute a user hash using a simple random string (no crypto).
 * @param omangID - Botswana Omang ID
 * @param phoneNumber - User's phone number
 * @returns Promise resolving to the user hash string
 */
export async function computeUserHash(omangID: string, phoneNumber: string): Promise<string> {
  // No crypto: just return a pseudo-random string
  return 'userhash_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Hash a password using a simple random string (no crypto).
 * @param password - Plain password
 * @returns Promise resolving to the password hash string
 */
export async function hashPassword(password: string): Promise<string> {
  // No crypto: just return a pseudo-random string
  return 'pw_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Register a new user, store in users.json, and save DID in AsyncStorage.
 * @param params - User registration fields
 * @returns Promise resolving to { userHash, did }
 */
export async function registerUser(params: {
  fullName: string;
  email: string;
  phoneNumber: string;
  omangID: string;
  gender: "Male" | "Female";
  password: string;
}): Promise<{ userHash: string; did: string }> {
  const { fullName, email, phoneNumber, omangID, password } = params;

  // Validate Omang ID
  if (!/^\d{9}$/.test(omangID)) {
    throw new Error('Omang ID must be 9 digits.');
  }

  // Validate Botswana phone number
  if (!/^\+2677\d{7}$/.test(phoneNumber)) {
    throw new Error('Phone number must be in format +2677XXXXXXX.');
  }

  // Auto-detect gender from Omang ID
  let gender: "Male" | "Female" = "Male";
  const seventhDigit = parseInt(omangID[6], 10);
  gender = seventhDigit >= 5 ? "Male" : "Female";

  const userHash = await computeUserHash(omangID, phoneNumber);
  const did = "did:bw:" + uuidv4();
  const passwordHash = await hashPassword(password);
  const createdAt = new Date().toISOString();

  const userRecord: UserRecord = {
    userHash,
    did,
    fullName,
    email,
    phone_number: phoneNumber,
    omangID,
    gender,
    passwordHash,
    createdAt,
  };

  let users: UserRecord[] = [];
  try {
    const fileInfo = await FileSystem.getInfoAsync(USERS_FILE);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(USERS_FILE, JSON.stringify([], null, 2));
    }
    const content = await FileSystem.readAsStringAsync(USERS_FILE);
    users = JSON.parse(content) as UserRecord[];
  } catch {
    users = [];
  }

  users.push(userRecord);
  await FileSystem.writeAsStringAsync(USERS_FILE, JSON.stringify(users, null, 2));
  await AsyncStorage.setItem('userDid', did);

  return { userHash, did };
}

/**
 * Read all user records from users.json.
 * @returns Promise resolving to an array of UserRecord
 */
export async function readUsers(): Promise<UserRecord[]> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(USERS_FILE);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(USERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = await FileSystem.readAsStringAsync(USERS_FILE);
    return JSON.parse(content) as UserRecord[];
  } catch {
    return [];
  }
}

/**
 * Find a user record by DID.
 * @param did - The DID to search for
 * @returns Promise resolving to the UserRecord or null if not found
 */
export async function getUserByDid(did: string): Promise<UserRecord | null> {
  const users = await readUsers();
  return users.find(u => u.did === did) || null;
}

/**
 * Get the current user's DID from AsyncStorage.
 * @returns Promise resolving to the DID string or null if not set
 */
export async function getCurrentDid(): Promise<string | null> {
  return await AsyncStorage.getItem('userDid');
}
