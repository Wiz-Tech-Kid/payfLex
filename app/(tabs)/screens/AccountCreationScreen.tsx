import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LocalUserProfile, saveUserProfile } from '../../../modules/DIDstorage';
import { registerUser } from '../../../services/authService';
import { isValidBotswanaPhone } from '../../../utils/didStorage';

const { width, height } = Dimensions.get('window');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+2677\d{7}$/;
const omangRegex = /^\d{9}$/;
const GENDER_OPTIONS = ['Auto-detect', 'Male', 'Female'];

type RootStackParamList = {
  Login: undefined;
};

const getInputIcon = (field: string) => {
  const icons = {
    fullName: '👤',
    email: '📧',
    phone: '📱',
    omang: '🆔',
    password: '🔒',
    confirmPassword: '🔐',
  };
  return icons[field as keyof typeof icons] || '📝';
};

function generateRandomDid() {
  return 'did:bw:' + Math.random().toString(36).substring(2, 15);
}

export default function AccountCreationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const [fullName, setFullName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
  const [omangID, setOmangID] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [gender, setGender] = React.useState<string>('Auto-detect');
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const [buttonScale] = React.useState(new Animated.Value(1));

  // Auto-detect gender from omangID if possible
  let finalGender: 'Male' | 'Female' | 'Auto-detect' = gender as any;
  if (gender === 'Auto-detect' && omangRegex.test(omangID)) {
    const seventhDigit = parseInt(omangID[6], 10);
    finalGender = seventhDigit >= 5 ? 'Male' : 'Female';
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!emailRegex.test(email.trim())) newErrors.email = 'Invalid email address.';
    if (!isValidBotswanaPhone(phoneNumber.trim())) newErrors.phoneNumber = 'Phone must be in format +2677XXXXXXX.';
    if (!omangRegex.test(omangID.trim())) newErrors.omangID = 'Omang ID must be 9 digits.';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (finalGender !== 'Male' && finalGender !== 'Female') newErrors.gender = 'Gender must be Male or Female.';
    return newErrors;
  };

  const handleSubmit = async () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        omangID: omangID.trim(),
        gender: finalGender as 'Male' | 'Female',
        password: password.trim(),
      });

      // Save local profile after Supabase signup
      const user = result; // result is user object from registerUser
      if (!user || !user.id) {
        throw new Error('User registration failed: missing user information.');
      }
      const did = generateRandomDid();
      const profile: LocalUserProfile = {
        supabaseId: user.id,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phone: phoneNumber.trim(),
        omangId: omangID.trim(),
        gender: finalGender as string,
        did,
        createdAt: new Date().toISOString(),
      };
      try {
        await saveUserProfile(profile);
        await AsyncStorage.setItem('current_user_did', did);
      } catch (err) {
        Alert.alert('Warning', 'Failed to save local profile');
      }

      Alert.alert('Account Created', `Success!`, [
        {
          text: 'Continue',
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: '/(tabs)/screens/Login' }],
              })
            ),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    field: string,
    options: any = {}
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          focusedInput === field && styles.inputFocused,
          errors[field] && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#a0a0a0"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocusedInput(field)}
        onBlur={() => setFocusedInput(null)}
        {...options}
      />
      <View style={styles.inputIcon}>
        <Text style={styles.iconText}>{getInputIcon(field)}</Text>
      </View>
      {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>Join us and get started today</Text>
            </View>

            {renderInput(fullName, setFullName, 'Full Name', 'fullName')}
            {renderInput(email, setEmail, 'Email Address', 'email', {
              autoCapitalize: 'none',
              keyboardType: 'email-address',
            })}
            {renderInput(phoneNumber, setPhoneNumber, 'Phone Number (+2677XXXXXXX)', 'phoneNumber', {
              keyboardType: 'phone-pad',
              maxLength: 12,
            })}
            {renderInput(omangID, setOmangID, 'Omang ID', 'omang', {
              keyboardType: 'number-pad',
              maxLength: 9,
            })}
            {renderInput(password, setPassword, 'Password', 'password', {
              secureTextEntry: true,
            })}
            {renderInput(confirmPassword, setConfirmPassword, 'Confirm Password', 'confirmPassword', {
              secureTextEntry: true,
            })}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.button, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>{submitting ? 'Creating...' : 'Create Account'}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  // Your existing styles here or replace with Tailwind or custom theme
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    paddingLeft: 42,
  },
  inputFocused: {
    borderColor: '#764ba2',
    borderWidth: 1,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  inputIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  iconText: {
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#764ba2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -40,
    left: -50,
    backgroundColor: '#fff',
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    right: -30,
    backgroundColor: '#fff',
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: -30,
    left: 50,
    backgroundColor: '#fff',
  },
});
