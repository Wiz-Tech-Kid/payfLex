import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../../supabaseClient';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false); // <-- Add state

  
  const logoAnim = React.useRef(new Animated.Value(0)).current;
  const cardAnim = React.useRef(new Animated.Value(60)).current;
  const cardFade = React.useRef(new Animated.Value(0)).current;

  
  const waveAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
 
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 700,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 700,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      });
      if (error || !user) throw new Error('Invalid credentials');

      
      await AsyncStorage.setItem('current_user_did', 'did:payflex:dummy123456789');

     
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)/screens/HomeTabs');
      }, 1200);
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      {/* Animated VANTA-like waves background */}
      <Animated.View
        style={[
          styles.vantaWaves,
          {
            
            transform: [
              {
                translateX: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -80], 
                }),
              },
              {
                translateY: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20], 
                }),
              },
            ],
          },
        ]}
      >
        
        <View style={StyleSheet.absoluteFill}>
          <Animated.View
            style={{
              flex: 1,
              opacity: 0.7,
            }}
          >
            <SvgWaves color="#2b1663" />
          </Animated.View>
        </View>
      </Animated.View>
      {/* Animated logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoAnim,
            transform: [
              {
                translateY: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
              {
                scale: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="lock-closed-outline" size={48} color="#fff" />
        </View>
        <Text style={styles.logoText}>PayFlex</Text>
      </Animated.View>
      {/* Animated login card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardFade,
            transform: [{ translateY: cardAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={22} color="#a5b4fc" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#a5b4fc"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={22} color="#a5b4fc" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#a5b4fc"
          />
        </View>
        {/* Remember Me */}
        <TouchableOpacity
          style={styles.rememberMeRow}
          onPress={() => setRememberMe((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push('/(tabs)/screens/AccountCreationScreen')}
        >
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// SVG Waves component for background
function SvgWaves({ color = "#2b1663" }: { color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%" viewBox="0 0 400 300" style={{ position: 'absolute' }}>
          <Path
            d="M0 200 Q100 150 200 200 T400 200 V300 H0 Z"
            fill={color}
            opacity={0.25}
          />
          <Path
            d="M0 220 Q100 170 200 220 T400 220 V300 H0 Z"
            fill={color}
            opacity={0.18}
          />
          <Path
            d="M0 240 Q100 190 200 240 T400 240 V300 H0 Z"
            fill={color}
            opacity={0.12}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7c3aed', // fallback for native
    zIndex: 0,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 2,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#a5b4fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: '#0a7ea4',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  card: {
    width: width > 400 ? 370 : '90%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#a5b4fc',
    marginBottom: 22,
    fontWeight: '500',
  },
  inputWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  createAccountButton: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c3aed',
    backgroundColor: '#fff',
  },
  createAccountText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: 2,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#a5b4fc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  rememberMeText: {
    color: '#7c3aed',
    fontWeight: '500',
    fontSize: 15,
  },
  vantaWaves: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#010A11',
  },
});
