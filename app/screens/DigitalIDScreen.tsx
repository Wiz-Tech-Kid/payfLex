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
  const navigation = useNavigation<any>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const currentDid = await getCurrentDid();
      if (!mounted) return;
      if (!currentDid) {
        setDid(null);
        setUser(null);
        setError('Please log in first');
        setLoading(false);
        return;
      }
      setDid(currentDid);
      const userRecord = await getUserByDid(currentDid);
      if (!mounted) return;
      if (!userRecord) {
        setError('User not found.');
        setUser(null);
      } else {
        setUser(userRecord);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userDid');
    Alert.alert('Logged out', 'You have been logged out.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('index'),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Your Digital Identity</Text>
      <View style={styles.card}>
        <LabelValue label="Full Name" value={user.fullName} />
        <Divider />
        <LabelValue label="Email" value={user.email} />
        <Divider />
        <LabelValue label="Phone Number" value={user.phoneNumber} />
        <Divider />
        <LabelValue label="Omang ID" value={user.omangID} />
        <Divider />
        <LabelValue label="Gender" value={user.gender} />
        <Divider />
        <LabelValue label="DID" value={user.did} />
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
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    padding: 16,
    paddingTop: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#1976d2',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#444',
    fontSize: 16,
  },
  value: {
    color: '#222',
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
  },
  logoutButtonText: {
    color: '#fff',
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
