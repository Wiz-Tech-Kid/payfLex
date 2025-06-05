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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    fontSize: 16,
  },
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
});
