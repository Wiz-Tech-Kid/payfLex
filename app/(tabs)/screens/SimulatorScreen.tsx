import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

function formatCurrency(val: number) {
  return 'P ' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getAmortizationSchedule(P: number, r: number, n: number) {
  const schedule = [];
  let balance = P;
  const monthlyPayment = (P * r) / (1 - Math.pow(1 + r, -n));
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principal = monthlyPayment - interest;
    schedule.push({
      month: i,
      payment: monthlyPayment,
      interest,
      principal,
      balance: Math.max(0, balance - principal),
    });
    balance -= principal;
  }
  return schedule;
}

export default function CalculatorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Form state
  const [loanAmount, setLoanAmount] = React.useState('');
  const [interestRate, setInterestRate] = React.useState('');
  const [termMonths, setTermMonths] = React.useState('');
  const [downPayment, setDownPayment] = React.useState('');
  const [focused, setFocused] = React.useState<string | null>(null);

  // Result state
  const [result, setResult] = React.useState<any>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [csvLoading, setCsvLoading] = React.useState(false);

  // Validation
  const valid =
    !!loanAmount &&
    !!interestRate &&
    !!termMonths &&
    parseFloat(loanAmount) > 0 &&
    parseFloat(interestRate) > 0 &&
    parseInt(termMonths) > 0;

  // Calculate handler
  const handleCalculate = () => {
    try {
      const P = parseFloat(loanAmount) - (parseFloat(downPayment) || 0);
      const r = parseFloat(interestRate) / 100 / 12;
      const n = parseInt(termMonths);
      if (P <= 0 || r <= 0 || n <= 0) throw new Error('Invalid input');
      const monthlyPayment = (P * r) / (1 - Math.pow(1 + r, -n));
      const totalRepayment = monthlyPayment * n;
      const totalInterest = totalRepayment - P;
      const schedule = getAmortizationSchedule(P, r, n);
      setResult({
        monthlyPayment,
        totalRepayment,
        totalInterest,
        schedule,
      });
      setModalVisible(true);
    } catch (e) {
      Alert.alert('Error', 'Please check your inputs.');
    }
  };

  // CSV Export
  const handleExportCSV = async () => {
    if (!result?.schedule) return;
    setCsvLoading(true);
    try {
      const rows = [
        'Month,Payment,Interest,Principal,Balance',
        ...result.schedule.map(
          (row: any) =>
            `${row.month},${row.payment.toFixed(2)},${row.interest.toFixed(2)},${row.principal.toFixed(2)},${row.balance.toFixed(2)}`
        ),
      ];
      const csv = rows.join('\n');
      const fileUri = FileSystem.documentDirectory + 'amortization_schedule.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('CSV Exported', `Saved to ${fileUri}`);
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export CSV.');
    }
    setCsvLoading(false);
  };

  
  const cardWidth = width > 500 ? 420 : '90%';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#18181b' : '#f8fafc' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', paddingVertical: 24, flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Loan Calculator</Text>
          {/* Loan Amount */}
          <View
            style={[
              styles.inputCard,
              { width: cardWidth, backgroundColor: isDark ? '#23232a' : '#fff', borderColor: focused === 'amount' ? '#7c3aed' : '#e5e7eb' },
              isDark && { shadowColor: '#000' },
            ]}
          >
            <Ionicons name="cash-outline" size={28} color="#7c3aed" style={styles.iconLeft} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: isDark ? '#a5b4fc' : '#7c3aed' }]}>Loan Amount</Text>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                keyboardType="numeric"
                placeholder="P 100,000"
                value={loanAmount}
                onFocus={() => setFocused('amount')}
                onBlur={() => setFocused(null)}
                onChangeText={setLoanAmount}
                placeholderTextColor={isDark ? '#a5b4fc' : '#7c3aed'}
              />
            </View>
          </View>
          {/* Interest Rate */}
          <View
            style={[
              styles.inputCard,
              { width: cardWidth, backgroundColor: isDark ? '#23232a' : '#fff', borderColor: focused === 'rate' ? '#7c3aed' : '#e5e7eb' },
            ]}
          >
            <Ionicons name="pricetag-outline" size={28} color="#7c3aed" style={styles.iconLeft} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: isDark ? '#a5b4fc' : '#7c3aed' }]}>Interest Rate (%)</Text>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                keyboardType="decimal-pad"
                placeholder="e.g. 12.5"
                value={interestRate}
                onFocus={() => setFocused('rate')}
                onBlur={() => setFocused(null)}
                onChangeText={setInterestRate}
                placeholderTextColor={isDark ? '#a5b4fc' : '#7c3aed'}
              />
            </View>
          </View>
          {/* Term Months */}
          <View
            style={[
              styles.inputCard,
              { width: cardWidth, backgroundColor: isDark ? '#23232a' : '#fff', borderColor: focused === 'term' ? '#7c3aed' : '#e5e7eb' },
            ]}
          >
            <Ionicons name="calendar-outline" size={28} color="#7c3aed" style={styles.iconLeft} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: isDark ? '#a5b4fc' : '#7c3aed' }]}>Term (Months)</Text>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                keyboardType="number-pad"
                placeholder="e.g. 36"
                value={termMonths}
                onFocus={() => setFocused('term')}
                onBlur={() => setFocused(null)}
                onChangeText={setTermMonths}
                placeholderTextColor={isDark ? '#a5b4fc' : '#7c3aed'}
              />
            </View>
          </View>
          {/* Down Payment */}
          <View
            style={[
              styles.inputCard,
              { width: cardWidth, backgroundColor: isDark ? '#23232a' : '#fff', borderColor: focused === 'down' ? '#7c3aed' : '#e5e7eb' },
            ]}
          >
            <Ionicons name="remove-circle-outline" size={28} color="#7c3aed" style={styles.iconLeft} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: isDark ? '#a5b4fc' : '#7c3aed' }]}>Down Payment (optional)</Text>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                keyboardType="numeric"
                placeholder="P 10,000"
                value={downPayment}
                onFocus={() => setFocused('down')}
                onBlur={() => setFocused(null)}
                onChangeText={setDownPayment}
                placeholderTextColor={isDark ? '#a5b4fc' : '#7c3aed'}
              />
            </View>
          </View>
        </ScrollView>
        {/* Sticky Calculate Button */}
        <View style={[styles.footerCard, { backgroundColor: isDark ? '#23232a' : '#fff', borderColor: '#7c3aed', width: cardWidth }]}>
          <TouchableOpacity
            style={[
              styles.calcButton,
              {
                opacity: valid ? 1 : 0.5,
                backgroundColor: valid ? undefined : '#a5b4fc',
              },
            ]}
            activeOpacity={0.85}
            onPress={handleCalculate}
            disabled={!valid}
          >
            <View style={styles.gradientBg} />
            <Text style={styles.calcButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>
        {/* Result Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <AnimatedResultModal
              result={result}
              onClose={() => setModalVisible(false)}
              onExportCSV={handleExportCSV}
              csvLoading={csvLoading}
              isDark={isDark}
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AnimatedResultModal({ result, onClose, onExportCSV, csvLoading, isDark }: any) {
  const [slideAnim] = React.useState(new Animated.Value(400)); // Use imported Animated
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);
  if (!result) return null;
  const first = result.schedule[0];
  const last = result.schedule[result.schedule.length - 1];
  return (
    <Animated.View
      style={[
        styles.resultModal,
        {
          backgroundColor: isDark ? '#18181b' : '#fff',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={28} color={isDark ? '#fff' : '#7c3aed'} />
      </TouchableOpacity>
      <Text style={[styles.resultTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Loan Results</Text>
      <Text style={[styles.resultLabel, { color: '#7c3aed' }]}>Monthly Payment</Text>
      <Text style={[styles.resultValue, { color: isDark ? '#fff' : '#1e293b' }]}>{formatCurrency(result.monthlyPayment)}</Text>
      <Text style={[styles.resultLabel, { color: '#7c3aed' }]}>Total Interest Paid</Text>
      <Text style={[styles.resultValue, { color: isDark ? '#fff' : '#1e293b' }]}>{formatCurrency(result.totalInterest)}</Text>
      <Text style={[styles.resultLabel, { color: '#7c3aed' }]}>Total Repayment</Text>
      <Text style={[styles.resultValue, { color: isDark ? '#fff' : '#1e293b' }]}>{formatCurrency(result.totalRepayment)}</Text>
      <View style={styles.amortSummary}>
        <Text style={[styles.amortTitle, { color: isDark ? '#a5b4fc' : '#7c3aed' }]}>Amortization Summary</Text>
        <Text style={[styles.amortRow, { color: isDark ? '#fff' : '#1e293b' }]}>
          Month 1: {formatCurrency(first.payment)} → {formatCurrency(first.interest)} interest, {formatCurrency(first.principal)} principal
        </Text>
        <Text style={[styles.amortRow, { color: isDark ? '#fff' : '#1e293b' }]}>
          Month {last.month}: {formatCurrency(last.payment)} → {formatCurrency(last.interest)} interest, {formatCurrency(last.principal)} principal
        </Text>
      </View>
      <TouchableOpacity style={styles.exportBtn} onPress={onExportCSV} disabled={csvLoading}>
        {csvLoading ? <ActivityIndicator color="#7c3aed" /> : <Ionicons name="download-outline" size={22} color="#7c3aed" />}
        <Text style={[styles.exportText, { color: '#7c3aed' }]}>Download CSV</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 8,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    width: '90%',
    backgroundColor: '#fff',
  },
  iconLeft: {
    marginRight: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  footerCard: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '90%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  calcButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(90deg,#7c3aed,#c084fc)',
    overflow: 'hidden',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: undefined,
    // Use a fallback color for native, gradient for web
  },
  calcButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  resultModal: {
    width: '96%',
    alignSelf: 'center',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 6,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  amortSummary: {
    marginTop: 18,
    marginBottom: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  amortTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  amortRow: {
    fontSize: 15,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c3aed',
    backgroundColor: '#f3f4f6',
  },
  exportText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
