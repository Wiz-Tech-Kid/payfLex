import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local user profile linked to a Supabase user.
 * The supabaseId field links this JSON record to the Supabase user.
 */
export interface LocalUserProfile {
  supabaseId: string;
  email: string;
  fullName: string;
  phone: string;
  omangId: string;
  gender: string;
  did: string;
  createdAt: string;
}

/**
 * Save or update a user profile in AsyncStorage under "user_profiles".
 * If a profile with the same supabaseId exists, it is replaced.
 * @param profile LocalUserProfile to save
 */
export async function saveUserProfile(profile: LocalUserProfile): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem('user_profiles');
    let arr: LocalUserProfile[] = [];
    if (raw) {
      arr = JSON.parse(raw);
    }
    const idx = arr.findIndex((p) => p.supabaseId === profile.supabaseId);
    if (idx !== -1) {
      arr[idx] = profile;
    } else {
      arr.push(profile);
    }
    await AsyncStorage.setItem('user_profiles', JSON.stringify(arr));
  } catch (err) {
    console.error('Failed to save user profile:', err);
    throw err;
  }
}

/**
 * Get a user profile by Supabase user ID.
 * Returns the profile or null if not found.
 */
export async function getUserProfileBySupabaseId(supabaseId: string): Promise<LocalUserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem('user_profiles');
    if (!raw) return null;
    const arr: LocalUserProfile[] = JSON.parse(raw);
    return arr.find((p) => p.supabaseId === supabaseId) || null;
  } catch (err) {
    console.warn('Failed to get user profile:', err);
    return null;
  }
}

/**
 * Get all local user profiles (for debugging only).
 * This is a temporary local store until Supabase full-profile integration is done.
 */
export async function getAllProfiles(): Promise<LocalUserProfile[]> {
  try {
    const raw = await AsyncStorage.getItem('user_profiles');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
