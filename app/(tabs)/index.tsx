<<<<<<< HEAD
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Landing() {
  const navigation = useNavigation();

  const handleLogin = () => {
    // Navigate to login screen
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#9333EA']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroCard}>
              <Ionicons name="phone-portrait" size={80} color="white" />
              <Text style={styles.heroSubtext}>African Mobile Banking</Text>
            </View>
          </View>
          
          <View style={styles.bottomSection}>
            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.title}>SmartLoan Africa</Text>
              <Text style={styles.subtitle}>
                Get instant auto loans with flexible repayment. Pay anywhere, anytime.
              </Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.featureText}>Instant approval in minutes</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.featureText}>Multiple payment options</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.featureText}>Works on any phone</Text>
              </View>
            </View>

            {/* Payment Methods Preview */}
            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Pay with any method:</Text>
              <View style={styles.paymentGrid}>
                <View style={styles.paymentMethod}>
                  <Ionicons name="card" size={24} color="white" />
                  <Text style={styles.paymentLabel}>Card</Text>
                </View>
                <View style={styles.paymentMethod}>
                  <Ionicons name="wallet" size={24} color="white" />
                  <Text style={styles.paymentLabel}>Wallet</Text>
                </View>
                <View style={styles.paymentMethod}>
                  <Ionicons name="qr-code" size={24} color="white" />
                  <Text style={styles.paymentLabel}>QR</Text>
                </View>
                <View style={styles.paymentMethod}>
                  <Ionicons name="call" size={24} color="white" />
                  <Text style={styles.paymentLabel}>USSD</Text>
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
=======
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [buttonScale] = useState(new Animated.Value(1));

  const handleButtonPress = () => {
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
    
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }],
        })
      );
    }, 200);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Floating circles for background decoration */}
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
          
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'username' && styles.inputFocused
                ]}
                placeholder="Email or Username"
                placeholderTextColor="#a0a0a0"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
              />
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>👤</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused
                ]}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
              />
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/screens/HomeTabs')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
              onPress={() => router.push('/screens/AccountCreationScreen')}
              >
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
     {/* Toggle Botsonic Chatbot */}
            <TouchableOpacity style={styles.chatbotButton} onPress={() => setShowChatbot(!showChatbot)}>
              <Text style={styles.chatbotButtonText}>{showChatbot ? "Hide Chatbot" : "Open Chatbot"}</Text>
            </TouchableOpacity>

            {/* Embedded Botsonic Chatbot */}
            {showChatbot && (
              <View style={{ height: 400, width: '100%', marginTop: 20 }}>
                <WebView
                  source={{
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                    <body>
                      <script>
                        (function (w, d, s, o, f, js, fjs) {
                          w["botsonic_widget"] = o;
                          w[o] = w[o] || function () {
                            (w[o].q = w[o].q || []).push(arguments);
                          };
                          (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
                          js.id = o;
                          js.src = f;
                          js.async = 1;
                          fjs.parentNode.insertBefore(js, fjs);
                        })(window, document, "script", "Botsonic", "https://widget.botsonic.com/CDN/botsonic.min.js");
                        Botsonic("init", {
                          serviceBaseUrl: "https://api-azure.botsonic.ai",
                          token: "0dfc3446-e750-4841-a1bf-4c79da9372bd",
                        });
                      </script>
                    </body>
                    </html>
                    `
                  }}
                  style={{ flex: 1, borderRadius: 10 }}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
>>>>>>> 60740f333462f055e0448f6983faf0ec73b30039
  );
}

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

const styles = StyleSheet.create<{
  container: ViewStyle;
  gradient: ViewStyle;
  content: ViewStyle;
  heroSection: ViewStyle;
  heroCard: ViewStyle;
  heroSubtext: TextStyle;
  bottomSection: ViewStyle;
  appInfo: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  features: ViewStyle;
  featureItem: ViewStyle;
  featureText: TextStyle;
  paymentCard: ViewStyle;
  paymentTitle: TextStyle;
  paymentGrid: ViewStyle;
  paymentMethod: ViewStyle;
  paymentLabel: TextStyle;
  buttonContainer: ViewStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
}>({
  container: {
    flex: 1,
  },
<<<<<<< HEAD
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    width: 288,
    height: 224,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 16,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 12,
  },
  paymentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  paymentTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  paymentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    alignItems: 'center',
    flex: 1,
  },
  paymentLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
=======
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    top: height * 0.2,
    right: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: height * 0.1,
    left: width * 0.1,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '400',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    width: '100%',
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
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  iconText: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#a0aec0',
    fontSize: 14,
    fontWeight: '600',
  },
  socialButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  socialButtonText: {
    color: '#4a5568',
    fontWeight: '600',
>>>>>>> 60740f333462f055e0448f6983faf0ec73b30039
    fontSize: 16,
    fontWeight: '500',
  },
<<<<<<< HEAD
});
=======
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#718096',
    fontSize: 16,
  },
  signUpText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '700',
  },
  chatbotButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
    borderRadius: 16,
    alignItems: 'center',
  },
  chatbotButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
>>>>>>> 60740f333462f055e0448f6983faf0ec73b30039
