import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SidebarDrawer from '../../components/ui/SidebarDrawer';
import { Colors } from '../../constants/Colors';
import {
  getCurrentDid,
  getUserByDid,
  UserRecord,
} from '../../modules/DigitalIdentityLedger';

export default function DigitalIDScreen() {
  const [loading, setLoading] = useState(true);
  const [did, setDid] = useState<string | null>(null);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
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

    loadUserData();

    // Cleanup: prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []);

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    navigation.navigate(route);
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    await AsyncStorage.removeItem('userDid');
    Alert.alert('Logged out', 'You have been logged out.', [
      {
        text: 'OK',
        // Replace 'index' with your actual login route if different
        onPress: () => navigation.navigate('Landing'),
      },
    ]);
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
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>User not found.</Text>
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
        <LabelValue label="Full Name" value={user.fullName} />
        <Divider />
        <LabelValue label="Email" value={user.email} />
        <Divider />
        <LabelValue
          label="Phone Number"
          value={user.phone_number || 'N/A'}
        />
        <Divider />
        <LabelValue label="Omang ID" value={user.omangID} />
        <Divider />
        <LabelValue label="Gender" value={user.gender} />
        <Divider />
        <LabelValue label="DID" value={did || 'Not found'} />
        <Divider />
        <LabelValue
          label="Created At"
          value={new Date(user.createdAt).toLocaleString()}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
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
});
