
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function BankTransferScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [reference, setReference] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleProceed = () => {
  
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      alert(
        `Bank: ${bankName}\nBranch: ${branchCode}\nAccount: ${accountNumber}\nRef: ${reference}\n\nPayment simulated.`
      );
    }, 2000);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#0f172a' : '#f9fafb' },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.header,
              { color: isDark ? 'white' : '#111827' },
            ]}
          >
            Bank Transfer
          </Text>

          <View style={styles.formCard}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1e293b' : 'white',
                  color: isDark ? 'white' : '#111827',
                },
              ]}
              placeholder="Bank Name"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={bankName}
              onChangeText={setBankName}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1e293b' : 'white',
                  color: isDark ? 'white' : '#111827',
                },
              ]}
              placeholder="Branch Code"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              keyboardType="number-pad"
              value={branchCode}
              onChangeText={setBranchCode}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1e293b' : 'white',
                  color: isDark ? 'white' : '#111827',
                },
              ]}
              placeholder="Account Number"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1e293b' : 'white',
                  color: isDark ? 'white' : '#111827',
                },
              ]}
              placeholder="Reference (optional)"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={reference}
              onChangeText={setReference}
            />

            <TouchableOpacity
              style={[
                styles.proceedButton,
                {
                  backgroundColor: isDark ? '#7c3aed' : '#7c3aed',
                },
              ]}
              activeOpacity={0.8}
              onPress={handleProceed}
              disabled={!bankName || !branchCode || !accountNumber || verifying}
            >
              {verifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text style={styles.proceedText}>Proceed to Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  formCard: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4c1d95',
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  proceedText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
});
