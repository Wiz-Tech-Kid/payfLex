import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { runSimulation } from '../../modules/FinancialTwinSimulator';

export default function SimulatorScreen() {
  const [loanAmount, setLoanAmount] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [avgExpenses, setAvgExpenses] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSimulate = () => {
    const input = {
      loanAmount: parseFloat(loanAmount),
      income: parseFloat(monthlyIncome),
      expenses: parseFloat(avgExpenses),
      months: 12,
      interestRate: 12,
    };
    const simResult = runSimulation(input);
    setResult(simResult);
  };

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.input}
        placeholder="Loan Amount"
        value={loanAmount}
        onChangeText={setLoanAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Monthly Income"
        value={monthlyIncome}
        onChangeText={setMonthlyIncome}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Average Expenses"
        value={avgExpenses}
        onChangeText={setAvgExpenses}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSimulate}>
        <Text style={styles.buttonText}>Simulate</Text>
      </TouchableOpacity>
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Default Probability: {result.overdraftRisk}%</Text>
          <Text style={styles.resultText}>
            Worst-case drop: {result.worstCase} … Best-case peak: {result.bestCase}
          </Text>
        </View>
      )}
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
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
  resultBox: {
    marginTop: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    color: '#0a7ea4',
    marginBottom: 4,
  },
});
