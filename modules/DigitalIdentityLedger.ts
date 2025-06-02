import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

/**
 * User record for the digital identity ledger.
 */
export interface UserRecord {
  userHash: string;
  did: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  omangID: string;
  gender: "Male" | "Female";
  passwordHash: string;
  createdAt: string;
}

const USERS_FILE = FileSystem.documentDirectory + 'users.json';
const SECRET_KEY = 'SUPER_SECRET_KEY';

/**
 * Compute a user hash using HMAC-SHA256 of omangID and phoneNumber.
 * @param omangID - Botswana Omang ID
 * @param phoneNumber - User's phone number
 * @returns Promise resolving to the user hash string
 */
export async function computeUserHash(omangID: string, phoneNumber: string): Promise<string> {
  const data = SECRET_KEY + omangID + phoneNumber;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
}

/**
 * Hash a password using SHA256.
 * @param password - Plain password
 * @returns Promise resolving to the password hash string
 */
export async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
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
  const { fullName, email, phoneNumber, omangID, gender, password } = params;
  const userHash = await computeUserHash(omangID, phoneNumber);
  const did = "did:bw:" + uuidv4();
  const passwordHash = await hashPassword(password);
  const createdAt = new Date().toISOString();

  const userRecord: UserRecord = {
    userHash,
    did,
    fullName,
    email,
    phoneNumber,
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
