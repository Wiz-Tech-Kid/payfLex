import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SidebarDrawer from '../../components/ui/SidebarDrawer';
import { Colors } from '../../constants/Colors';
import { useBalance } from '../../hooks/useBalance';
import { sendPayment } from '../../services/paymentService';

export default function SendMoneyScreen() {
  const { balance } = useBalance();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: Replace this with actual logic to get the current user's DID
  const currentUserDid = 'your-current-user-did';

  const handleSend = async () => {
    setLoading(true);
    setMessage('');
    try {
      await sendPayment({
        fromDid: currentUserDid,
        toIdentifier: recipient,
        amount: parseFloat(amount),
        channel: 'bank',
      });
      setMessage('Payment sent successfully.');
    } catch (e) {
      setMessage('Error sending money.');
    }
    setLoading(false);
  };

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    // Use navigation logic if needed
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    // Use navigation logic if needed
  };

  return (
    <View style={styles.card}>
      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNav}
        onLogout={handleLogout}
      />
      <Text style={styles.balance}>Balance: P {balance}</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Recipient DID or Alias"
          value={recipient}
          onChangeText={setRecipient}
          placeholderTextColor={Colors.light.icon}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholderTextColor={Colors.light.icon}
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
    margin: 16,
    padding: 16,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.tint,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.icon,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: Colors.light.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.light.tint,
    textAlign: 'center',
  },
});
