// utils/didStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import 'react-native-get-random-values';

const DID_REGISTRY_PATH = FileSystem.documentDirectory + 'did_registry.json';

export async function setDid(userId: string, did: string) {
  let registry: any[] = [];
  try {
    const content = await FileSystem.readAsStringAsync(DID_REGISTRY_PATH);
    registry = JSON.parse(content);
  } catch {}
  // Remove any existing entry for this user
  registry = registry.filter((entry) => entry.uid !== userId);
  registry.push({ uid: userId, did });
  await FileSystem.writeAsStringAsync(DID_REGISTRY_PATH, JSON.stringify(registry, null, 2));
  await AsyncStorage.setItem('userDid', did);
}

export async function getDid(userId: string): Promise<string | null> {
  try {
    const content = await FileSystem.readAsStringAsync(DID_REGISTRY_PATH);
    const registry = JSON.parse(content);
    const entry = registry.find((e: any) => e.uid === userId);
    return entry ? entry.did : null;
  } catch {
    return null;
  }
}

export async function getCurrentDid(): Promise<string | null> {
  return AsyncStorage.getItem('userDid');
}

// Botswana phone validation utility
export function isValidBotswanaPhone(phone: string): boolean {
  // Must start with +2677 and be 12 digits total
  return /^\+2677\d{7}$/.test(phone);
}
