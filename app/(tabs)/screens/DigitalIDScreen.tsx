import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SidebarDrawer from '../../../components/ui/SidebarDrawer';
import { Colors } from '../../../constants/Colors';

const DUMMY_PROFILE = {
  fullName: 'Nickel Sentsima',
  email: 'n.bobo@example.com',
  phone: '+26771234567',
  omangId: '02391234', 
  gender: 'male',
  did: 'did:payflex:0033fe22-8a46-4fad-bc06-1e3ae8366e1f',
  createdAt: new Date().toISOString(),
  
};

const { width } = Dimensions.get('window');

export default function DigitalIDScreen() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editFullName, setEditFullName] = React.useState(DUMMY_PROFILE.fullName);
  const [editPhone, setEditPhone] = React.useState(DUMMY_PROFILE.phone);
  const [editGender, setEditGender] = React.useState(DUMMY_PROFILE.gender);
  const router = useRouter();

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    
  };

  const handleSidebarLogout = () => {
    setSidebarOpen(false);
    // Do nothing else, or add your custom logic here
  };

  const handleSaveProfile = async () => {
    setEditMode(false);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SidebarDrawer
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNavigate={handleSidebarNav}
            onLogout={handleSidebarLogout}
          />
          <Text style={styles.heading}>Your Digital Identity</Text>
          <View style={styles.card}>
            {editMode ? (
              <>
                <LabelValue label="Full Name" value={
                  <TextInput
                    value={editFullName}
                    onChangeText={setEditFullName}
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#aaa"
                  />
                } />
                <Divider />
                <LabelValue label="Phone Number" value={
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                  />
                } />
                <Divider />
                <LabelValue label="Gender" value={
                  <TextInput
                    value={editGender}
                    onChangeText={setEditGender}
                    style={styles.input}
                    placeholder="Gender"
                    placeholderTextColor="#aaa"
                  />
                } />
                <Divider />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { setEditMode(false); Keyboard.dismiss(); }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <LabelValue label="Full Name" value={editFullName} />
                <Divider />
                <LabelValue label="Email" value={DUMMY_PROFILE.email} />
                <Divider />
                <LabelValue label="Phone Number" value={editPhone} />
                <Divider />
                <LabelValue label="Omang ID" value={DUMMY_PROFILE.omangId} />
                <Divider />
                <LabelValue label="Gender" value={editGender} />
                <Divider />
                <LabelValue label="DID" value={DUMMY_PROFILE.did} />
                <Divider />
                <LabelValue label="Created At" value={new Date(DUMMY_PROFILE.createdAt).toLocaleString()} />
                <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LabelValue({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <View style={styles.labelValueRow}>
      <Text style={styles.label}>{label}:</Text>
      <View style={styles.valueWrap}>{typeof value === 'string' ? <Text style={styles.value}>{value}</Text> : value}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: width < 350 ? 8 : 16,
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: '100%',
    backgroundColor: Colors.light.background,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: Colors.light.tint,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: width < 350 ? 14 : 20,
    width: '100%',
    maxWidth: 420,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 24,
    alignItems: 'center',
  },
  labelValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 7,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '600',
    color: Colors.light.icon,
    fontSize: 15,
    flex: 1,
  },
  valueWrap: {
    flex: 2,
    alignItems: 'flex-end',
  },
  value: {
    color: Colors.light.text,
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
    width: '100%',
  },
  editButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#388e3c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#bdbdbd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: Colors.light.text,
    marginTop: 8,
    width: '100%',
    backgroundColor: '#f8fafc',
  },
});
