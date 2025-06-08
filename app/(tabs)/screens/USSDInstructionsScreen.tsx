import * as React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function USSDInstructionsScreen() {
  const ussdCode = '*737*LOAN*PAY#';

  const handleCopy = () => {
    Alert.alert('Copied', 'USSD code copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>USSD Payment</Text>
      <View style={styles.ussdBox}>
        <Text style={styles.ussdCode}>{ussdCode}</Text>
      </View>
      <Text style={styles.instructions}>
        Dial the code above from your mobile phone and follow the prompts to make a payment. No internet required!
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleCopy}>
        <Text style={styles.buttonText}>Copy Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#0a7ea4' },
  ussdBox: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 24, elevation: 2 },
  ussdCode: { fontSize: 24, color: '#8B5CF6', fontWeight: 'bold', letterSpacing: 2 },
  instructions: { fontSize: 14, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: '#0a7ea4', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
