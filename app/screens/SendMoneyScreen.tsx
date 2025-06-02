import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useBalance } from '../../hooks/useBalance';
import { sendPayment } from '../../modules/UnifiedPaymentsEngine';

export default function SendMoneyScreen() {
  const { balance } = useBalance();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await sendPayment({
        fromUserId: 'user123',
        toUserId: recipient,
        amount: parseFloat(amount),
        channel: 'bank',
      });
      setMessage(result.success ? result.message : result.message);
    } catch (e) {
      setMessage('Error sending money.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.balance}>Balance: P {balance}</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Recipient DID or Alias"
          value={recipient}
          onChangeText={setRecipient}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 24,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0a7ea4',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  button: {
    width: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    color: '#0a7ea4',
    textAlign: 'center',
  },
});
