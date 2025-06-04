import { CommonActions, NavigationProp, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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
  View
} from 'react-native';
import { registerUser } from '../../modules/DigitalIdentityLedger';

const { width, height } = Dimensions.get('window');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{8}$/;
const omangRegex = /^\d{9}$/; // Botswana Omang ID is 9 digits

type RootStackParamList = {
  Login: undefined;
  // add other routes here if needed
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

export default function AccountCreationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
<<<<<<< HEAD
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [omangID, setOmangID] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [gender, setGender] = useState<string>('Auto-detect');
=======
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [omangID, setOmangID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
>>>>>>> 6dd516136125553f610324d8f1285c3ac3d4712b
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [buttonScale] = useState(new Animated.Value(1));

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
    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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
            onPress: () => navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            ),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
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
          errors[field] && styles.inputError
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
=======
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
>>>>>>> 6dd516136125553f610324d8f1285c3ac3d4712b
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
        {/* Floating circles for background decoration */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>Join us and get started today</Text>
            </View>

            {/* Full Name */}
            {renderInput(fullName, setFullName, 'Full Name', 'fullName')}

            {/* Email */}
            {renderInput(email, setEmail, 'Email Address', 'email', {
              autoCapitalize: 'none',
              keyboardType: 'email-address'
            })}

            {/* Phone Number */}
            {renderInput(phoneNumber, setPhoneNumber, 'Phone Number (8 digits)', 'phone', {
              keyboardType: 'number-pad',
              maxLength: 8
            })}

            {/* Omang ID */}
            {renderInput(omangID, setOmangID, 'Omang ID', 'omang', {
              keyboardType: 'number-pad',
              maxLength: 9
            })}

            {/* Gender Selection */}
            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                {GENDER_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      gender === option && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        gender === option && styles.genderOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
              {gender === 'Auto-detect' && omangRegex.test(omangID) && (
                <View style={styles.autoDetectBadge}>
                  <Text style={styles.autoDetectText}>
                    ✨ Auto-detected: {finalGender}
                  </Text>
                </View>
              )}
            </View>

            {/* Password */}
            {renderInput(password, setPassword, 'Password (min 8 characters)', 'password', {
              secureTextEntry: true
            })}

            {/* Confirm Password */}
            {renderInput(confirmPassword, setConfirmPassword, 'Confirm Password', 'confirmPassword', {
              secureTextEntry: true
            })}

            <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity
                style={[styles.button, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={submitting ? ['#a0a0a0', '#808080'] : ['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {submitting ? '🔄 Creating Account...' : '🚀 Create Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: height * 0.3,
    right: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: height * 0.1,
    left: width * 0.1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    backdropFilter: 'blur(10px)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '400',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#f7fafc',
    color: '#2d3748',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#667eea',
    backgroundColor: '#fff',
    shadowColor: '#667eea',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  iconText: {
    fontSize: 20,
  },
  error: {
    color: '#e53e3e',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
    minWidth: 100,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  genderOptionText: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '600',
  },
  genderOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  autoDetectBadge: {
    backgroundColor: '#e6fffa',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#38b2ac',
  },
  autoDetectText: {
    color: '#2c7a7b',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#718096',
    fontSize: 16,
  },
  loginText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '700',
  },
});