import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SidebarDrawer from '../../components/ui/SidebarDrawer';
import { Colors } from '../../constants/Colors';
import { useOpenAIApi } from '../../hooks/useOpenAIApi';

export default function SimulatorScreen() {
  const [loanAmount, setLoanAmount] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [avgExpenses, setAvgExpenses] = useState('');
  const [result, setResult] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getOpenAIInsights } = useOpenAIApi();

  const handleSimulate = async () => {
    const input = {
      loanAmount: parseFloat(loanAmount),
      income: parseFloat(monthlyIncome),
      expenses: parseFloat(avgExpenses),
      months: 12,
      interestRate: 12,
    };
    setResult(null);
    // Get OpenAI suggestions (NLP-based analysis)
    if (getOpenAIInsights) {
      const aiSuggestion = await getOpenAIInsights(input);
      setResult({
        overdraftRisk: undefined,
        worstCase: undefined,
        bestCase: undefined,
        aiSuggestion,
      });
    }
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
      <TextInput
        style={styles.input}
        placeholder="Loan Amount"
        value={loanAmount}
        onChangeText={setLoanAmount}
        keyboardType="numeric"
        placeholderTextColor={Colors.light.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Monthly Income"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        keyboardType="numeric"
        placeholderTextColor={Colors.light.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Average Expenses"
        value={avgExpenses}
        onChangeText={setAvgExpenses}
        keyboardType="numeric"
        placeholderTextColor={Colors.light.icon}
      />
      <TouchableOpacity style={styles.button} onPress={handleSimulate}>
        <Text style={styles.buttonText}>Simulate</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.resultBox}>
          {result.aiSuggestion && (
            <Text style={styles.resultText}>{result.aiSuggestion}</Text>
          )}
        </View>
      )}
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
  input: {
    width: '100%',
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
  resultBox: {
    marginTop: 24,
    backgroundColor: Colors.light.icon,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resultText: {
    color: Colors.light.text,
    fontSize: 16,
    marginBottom: 4,
  },
});
