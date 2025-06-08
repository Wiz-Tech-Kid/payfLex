import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const DID_REGISTRY_PATH = FileSystem.documentDirectory + 'did_registry.json';

export interface DIDRegistryUser {
  fullName: string;
  email: string;
  phone: string;
  omangId: string;
  gender: string;
  did: string;
  createdAt: string;
}

export async function getUserFromRegistryByDID(did: string): Promise<DIDRegistryUser | null> {
  try {
    const content = await FileSystem.readAsStringAsync(DID_REGISTRY_PATH);
    const users: DIDRegistryUser[] = JSON.parse(content);
    return users.find(u => u.did === did) || null;
  } catch {
    return null;
  }
}

export async function getUserFromRegistryByEmail(email: string): Promise<DIDRegistryUser | null> {
  try {
    const content = await FileSystem.readAsStringAsync(DID_REGISTRY_PATH);
    const users: DIDRegistryUser[] = JSON.parse(content);
    return users.find(u => u.email === email) || null;
  } catch {
    return null;
  }
}

export async function getUserFromRegistryByPhone(phone: string): Promise<DIDRegistryUser | null> {
  try {
    const content = await FileSystem.readAsStringAsync(DID_REGISTRY_PATH);
    const users: DIDRegistryUser[] = JSON.parse(content);
    return users.find(u => u.phone === phone) || null;
  } catch {
    return null;
  }
}

export async function ensureDidRegistryFileExists() {
  const fileInfo = await FileSystem.getInfoAsync(DID_REGISTRY_PATH);
  if (!fileInfo.exists) {
    const asset = Asset.fromModule(require('../did_registry.json'));
    await asset.downloadAsync();
    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: DID_REGISTRY_PATH,
    });
  }
}
