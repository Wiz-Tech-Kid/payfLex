import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';
import { setDid } from '../utils/didStorage';

export async function registerUser({ fullName, email, phoneNumber, omangID, password }: {
  fullName: string;
  email: string;
  phoneNumber: string;
  omangID: string;
  password: string;
}) {
  // Use Supabase Auth signUp
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        omang_id: omangID,
      }
    }
  });
  if (error) throw error;

  // Generate and store DID locally and in registry
  const user = data.user;
  if (user?.id) {
    const newDid = `did:payflex:${uuidv4()}`;
    await setDid(user.id, newDid);
  }

  return data.user;
}

export async function loginUser({ identifier, password }: { identifier: string; password: string }) {
  // identifier can be email or phone
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });
  if (error || !data.user) throw new Error('Invalid credentials');
  // Session is now managed by supabase client

  // Set JWT claims in the database session
  const userDID = data.user.id; // Assuming the user ID is the DID
  await supabase.rpc('set_jwt_claims', { did: userDID });

  return data.user.id;
}
