// Hook to fetch user profile (mock)
import { useState } from 'react';

export function useUserProfile() {
  const [profile, setProfile] = useState({
    userId: 'user123',
    name: 'Test User',
    omang: '123456789',
    photoUrl: '',
  });
  return { profile };
}
