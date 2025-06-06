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
    fontSize: 16,
    fontWeight: '500',
  },
});