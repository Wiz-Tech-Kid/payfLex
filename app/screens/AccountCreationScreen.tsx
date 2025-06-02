import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { registerUser } from '../../modules/DigitalIdentityLedger';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{8}$/;
const omangRegex = /^\d{9}$/; // Botswana Omang ID is 9 digits

type RootStackParamList = {
  Login: undefined;
  // add other routes here if needed
};

export default function AccountCreationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [omangID, setOmangID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!emailRegex.test(email.trim()))
      newErrors.email = 'Invalid email address.';
    if (!phoneRegex.test(phoneNumber.trim()))
      newErrors.phoneNumber = 'Phone number must be 8 digits.';
    if (!omangRegex.test(omangID.trim()))
      newErrors.omangID = 'Omang ID must be 9 digits.';
    if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      // Auto-detect gender from Omang ID
      let detectedGender: "Male" | "Female" = "Male";
      if (omangID.length === 9) {
        const seventhDigit = parseInt(omangID[6], 10);
        detectedGender = seventhDigit >= 5 ? "Male" : "Female";
      }
      const { userHash, did } = await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        omangID: omangID.trim(),
        gender: detectedGender,
        password: password.trim(),
      });
      Alert.alert(
        'Account Created',
        `Success! Your new DID is: ${did}`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        {/* Full Name */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        {/* Phone Number */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number (8 digits)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="number-pad"
          maxLength={8}
        />
        {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}

        {/* Omang ID */}
        <TextInput
          style={styles.input}
          placeholder="Omang ID (9 digits)"
          value={omangID}
          onChangeText={setOmangID}
          keyboardType="number-pad"
          maxLength={9}
        />
        {errors.omangID && <Text style={styles.error}>{errors.omangID}</Text>}

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        {/* Confirm Password */}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Creating...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#0a7ea4',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  dropdownContainer: {
    marginVertical: 8,
  },
  dropdownLabel: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  dropdownRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  genderOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbb',
    marginRight: 8,
    backgroundColor: '#f8f8f8',
  },
  genderOptionSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  genderOptionText: {
    color: '#333',
    fontSize: 15,
  },
  genderOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  autodetectInfo: {
    fontSize: 13,
    color: '#1976d2',
    marginBottom: 8,
  },
});

