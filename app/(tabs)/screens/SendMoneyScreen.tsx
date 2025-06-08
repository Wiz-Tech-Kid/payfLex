import { useRouter } from 'expo-router';
import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import SidebarDrawer from '../../../components/ui/SidebarDrawer';
import { Colors } from '../../../constants/Colors';
import { useBalance } from '../../../hooks/useBalance';
import { sendPayment } from '../../../services/paymentService';

export default function SendMoneyScreen() {
  const router = useRouter();
  const { balance } = useBalance();
  const [recipient, setRecipient] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  
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
   
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    
  };

  // Payment Option Handlers
  const handleBankTransfer = () => {
    router.push('/(tabs)/screens/BankTransferScreen');
  };
  const handleMobileWallet = () => {
    router.push('/(tabs)/screens/MobileWalletScreen');
  };
  const handleQRCode = () => {
    router.push('/(tabs)/screens/QRCodeScreen');
  };
  const handleUSSDPayment = () => {
    router.push('/(tabs)/screens/USSDInstructionsScreen');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        <Text style={styles.title}>Choose Payment Method</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity style={styles.paymentOption} onPress={handleBankTransfer}>
            <Text style={styles.icon}>🏦</Text>
            <Text style={styles.label}>Bank Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption} onPress={handleMobileWallet}>
            <Text style={styles.icon}>📱</Text>
            <Text style={styles.label}>Mobile Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption} onPress={handleQRCode}>
            <Text style={styles.icon}>⬜</Text>
            <Text style={styles.label}>QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentOption} onPress={handleUSSDPayment}>
            <Text style={styles.icon}>☎️</Text>
            <Text style={styles.label}>USSD</Text>
          </TouchableOpacity>
        </View>
        {/* ...you can add more payment UI or logic below as needed... */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1F2937',
  },
  paymentOptions: {
    width: '100%',
    gap: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  icon: {
    fontSize: 28,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
