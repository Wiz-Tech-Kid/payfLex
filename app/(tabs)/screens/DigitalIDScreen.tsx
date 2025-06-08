import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SidebarDrawer from '../../../components/ui/SidebarDrawer';
import { Colors } from '../../../constants/Colors';
import { getUserProfileBySupabaseId, LocalUserProfile, saveUserProfile } from '../../../modules/DIDstorage';
import {
  getCurrentDid,
  getUserByDid,
  UserRecord,
} from '../../../modules/DigitalIdentityLedger';
import { supabase } from '../../../supabaseClient'; // adjust path if needed

export default function DigitalIDScreen() {
  const [loading, setLoading] = React.useState(true);
  const [did, setDid] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<UserRecord | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [localProfile, setLocalProfile] = React.useState<LocalUserProfile | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editFullName, setEditFullName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editGender, setEditGender] = React.useState('');
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    let mounted = true;

    const loadUserData = async () => {
      setLoading(true);
      setError(null);

      // 1. Fetch current DID (from AsyncStorage or however getCurrentDid is implemented)
      const currentDid = await getCurrentDid();
      if (!mounted) return;

      // 2. If no DID, show error and bail out
      if (!currentDid) {
        setDid(null);
        setUser(null);
        setError('Please log in first.');
        setLoading(false);
        return;
      }

      // 3. We have a DID, so fetch the corresponding user record
      setDid(currentDid);
      const userRecord = await getUserByDid(currentDid);
      if (!mounted) return;

      // 4. If user not found, set error; otherwise store user
      if (!userRecord) {
        setError('User not found.');
        setUser(null);
        setDid(null);
      } else {
        setUser(userRecord);
        setDid(currentDid);
      }

      setLoading(false);
    };

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate('/(tabs)/screens/Login');
        return;
      }
      const profile = await getUserProfileBySupabaseId(user.id);
      if (mounted) {
        setLocalProfile(profile);
        if (profile) {
          setEditFullName(profile.fullName);
          setEditPhone(profile.phone);
          setEditGender(profile.gender);
        }
      }
    };

    loadUserData();
    loadProfile();

    // Cleanup: prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []);

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    navigation.navigate(`/(tabs)/screens/${route}`);
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    await AsyncStorage.removeItem('userDid');
    Alert.alert('Logged out', 'You have been logged out.', [
      {
        text: 'OK',
        // Replace 'index' with your actual login route if different
        onPress: () => navigation.navigate('/(tabs)/index'),
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!localProfile) return;
    try {
      // Optionally update Supabase user data here
      await saveUserProfile({
        ...localProfile,
        fullName: editFullName,
        phone: editPhone,
        gender: editGender,
      });
      setLocalProfile({
        ...localProfile,
        fullName: editFullName,
        phone: editPhone,
        gender: editGender,
      });
      setEditMode(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save local profile');
    }
  };

  // 1. Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 3. No user record (fallback)
  if (!localProfile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No local profile found. Please re-enter your details.</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('/(tabs)/screens/AccountCreationScreen', { email: '' })}
        >
          <Text style={styles.logoutButtonText}>Go to Profile Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 4. Main UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNav}
        onLogout={handleLogout}
      />
      <Text style={styles.heading}>Your Digital Identity</Text>
      <View style={styles.card}>
        {editMode ? (
          <>
            <LabelValue label="Full Name" value={
              <TextInput value={editFullName} onChangeText={setEditFullName} style={styles.input} />
            } />
            <Divider />
            <LabelValue label="Phone Number" value={
              <TextInput value={editPhone} onChangeText={setEditPhone} style={styles.input} />
            } />
            <Divider />
            <LabelValue label="Gender" value={
              <TextInput value={editGender} onChangeText={setEditGender} style={styles.input} />
            } />
            <Divider />
            <TouchableOpacity style={styles.logoutButton} onPress={handleSaveProfile}>
              <Text style={styles.logoutButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={() => setEditMode(false)}>
              <Text style={styles.logoutButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <LabelValue label="Full Name" value={localProfile.fullName} />
            <Divider />
            <LabelValue label="Email" value={localProfile.email} />
            <Divider />
            <LabelValue label="Phone Number" value={localProfile.phone} />
            <Divider />
            <LabelValue label="Omang ID" value={localProfile.omangId} />
            <Divider />
            <LabelValue label="Gender" value={localProfile.gender} />
            <Divider />
            <LabelValue label="DID" value={localProfile.did} />
            <Divider />
            <LabelValue label="Created At" value={new Date(localProfile.createdAt).toLocaleString()} />
            <TouchableOpacity style={styles.logoutButton} onPress={() => setEditMode(true)}>
              <Text style={styles.logoutButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LabelValue({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <View style={styles.labelValueRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    padding: 16,
    paddingTop: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: Colors.light.tint,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 24,
  },
  labelValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 7,
  },
  label: {
    fontWeight: '600',
    color: Colors.light.icon,
    fontSize: 16,
  },
  value: {
    color: Colors.light.text,
    fontSize: 16,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
  },
  logoutButtonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    fontSize: 17,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 8,
  },
});
