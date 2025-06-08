import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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

const { width } = Dimensions.get('window');

// Supported providers with prefixes (mock)
const providers = [
  { name: 'MyZaka', prefix: '71', color: '#0ea5e9', code: '*151#' },
  { name: 'Orange Money', prefix: '72', color: '#fb923c', code: '*145#' },
  { name: 'Smega', prefix: '73', color: '#f43f5e', code: '*120#' },
];

export default function MobileWalletScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleNext = () => {
    if (step === 0 && selectedProvider) {
      setStep(1);
      return;
    }
    if (step === 1 && phoneNumber.startsWith(selectedProvider.prefix) && phoneNumber.length === 8) {
      setStep(2);
      return;
    }
    if (step === 2 && parseFloat(amount) > 0) {
      setStep(3);
      return;
    }
  };

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      alert(
        `Paid P${amount} to ${phoneNumber} via ${selectedProvider.name}.`
      );
      setStep(0);
      setPhoneNumber('');
      setAmount('');
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
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text
            style={[
              styles.header,
              { color: isDark ? 'white' : '#111827' },
            ]}
          >
            Mobile Wallet Payment
          </Text>

          {/* STEP 0: Select Provider */}
          {step === 0 && (
            <View style={styles.providerGrid}>
              {providers.map((prov) => (
                <TouchableOpacity
                  key={prov.name}
                  style={[
                    styles.providerCard,
                    {
                      borderColor:
                        selectedProvider.name === prov.name
                          ? prov.color
                          : isDark
                          ? '#334155'
                          : '#e5e7eb',
                      backgroundColor:
                        selectedProvider.name === prov.name
                          ? prov.color
                          : isDark
                          ? '#1e293b'
                          : 'white',
                    },
                  ]}
                  onPress={() => setSelectedProvider(prov)}
                >
                  <Ionicons name="logo-bitcoin" size={32} color="white" />
                  <Text style={styles.providerLabel}>{prov.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: isDark ? '#7c3aed' : '#7c3aed',
                  },
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 1: Enter Phone Number */}
          {step === 1 && (
            <View style={styles.formSection}>
              <Text style={[styles.stepLabel, { color: isDark ? 'white' : '#111827' }]}>
                Enter {selectedProvider.name} Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1e293b' : 'white',
                    color: isDark ? 'white' : '#111827',
                  },
                ]}
                placeholder={`${selectedProvider.prefix}xxxxxxx`}
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                keyboardType="number-pad"
                maxLength={8}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              {!phoneNumber.startsWith(selectedProvider.prefix) &&
                phoneNumber.length > 0 && (
                  <Text style={styles.errorText}>
                    Number must start with {selectedProvider.prefix}
                  </Text>
                )}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor:
                      phoneNumber.startsWith(selectedProvider.prefix) &&
                      phoneNumber.length === 8
                        ? '#7c3aed'
                        : '#9ca3af',
                  },
                ]}
                onPress={handleNext}
                disabled={
                  !(
                    phoneNumber.startsWith(selectedProvider.prefix) &&
                    phoneNumber.length === 8
                  )
                }
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Enter Amount */}
          {step === 2 && (
            <View style={styles.formSection}>
              <Text style={[styles.stepLabel, { color: isDark ? 'white' : '#111827' }]}>
                Enter Amount (BWP)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1e293b' : 'white',
                    color: isDark ? 'white' : '#111827',
                  },
                ]}
                placeholder="e.g., 100.00"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              {parseFloat(amount) <= 0 && amount.length > 0 && (
                <Text style={styles.errorText}>Enter a valid amount</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor:
                      parseFloat(amount) > 0 ? '#7c3aed' : '#9ca3af',
                  },
                ]}
                onPress={handleNext}
                disabled={!(parseFloat(amount) > 0)}
              >
                <Text style={styles.nextText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && (
            <View style={styles.formSection}>
              <Text style={[styles.stepLabel, { color: isDark ? 'white' : '#111827' }]}>
                Confirm Payment
              </Text>
              <View style={styles.confirmBox}>
                <Text
                  style={[
                    styles.confirmText,
                    { color: isDark ? 'white' : '#111827' },
                  ]}
                >
                  Provider: {selectedProvider.name}
                </Text>
                <Text
                  style={[
                    styles.confirmText,
                    { color: isDark ? 'white' : '#111827' },
                  ]}
                >
                  Number: {phoneNumber}
                </Text>
                <Text
                  style={[
                    styles.confirmText,
                    { color: isDark ? 'white' : '#111827' },
                  ]}
                >
                  Amount: BWP {amount}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: isDark ? '#7c3aed' : '#7c3aed',
                  },
                ]}
                onPress={handleConfirm}
              >
                {confirming ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.nextText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, alignItems: 'center' },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  providerGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  providerCard: {
    width: Math.floor((width - 72) / 2),
    height: Math.floor((width - 72) / 2),
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  providerLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  nextButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    width: '100%',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7c3aed',
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    marginBottom: 8,
  },
  confirmBox: {
    width: '100%',
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
});
