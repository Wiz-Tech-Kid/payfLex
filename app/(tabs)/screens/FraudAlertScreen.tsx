import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import SidebarDrawer from '../../../components/ui/SidebarDrawer';
import { useFraudScore } from '../../../hooks/useFraudScore';

export default function FraudAlertScreen() {
  const { fraudScore } = useFraudScore();
  const [score, setScore] = useState(fraudScore);
  const [scoreHistory, setScoreHistory] = useState<number[]>([fraudScore]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  // Simulate real-time fraud score updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newScore = Math.floor(Math.random() * 100);
      setScore(newScore);
      setScoreHistory(prev => [...prev.slice(-9), newScore]); // Keep last 10 scores
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    
  };

  const getRiskLevel = (score: number) => {
    if (score > 80) return { label: 'Critical', color: '#b00020', icon: 'alert-circle' };
    if (score > 60) return { label: 'High', color: '#e65100', icon: 'warning' };
    if (score > 40) return { label: 'Medium', color: '#fbc02d', icon: 'help-circle' };
    return { label: 'Low', color: '#2e7d32', icon: 'checkmark-circle' };
  };

  const { label, color, icon } = getRiskLevel(score);

  return (
    <View style={styles.container}>
      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNav}
        onLogout={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Real-Time Fraud Intelligence</Text>

        <View style={[styles.scoreContainer, { borderColor: color }]}>
          <Ionicons name={icon as any} size={32} color={color} />
          <Text style={[styles.scoreText, { color }]}>{score}/100</Text>
          <Text style={[styles.riskLabel, { color }]}>{label} Risk</Text>
        </View>

        <Text style={styles.subHeader}>Score Trend (Last 10 Checks)</Text>
        <LineChart
          data={{
            labels: Array(scoreHistory.length).fill(''),
            datasets: [{ data: scoreHistory }],
          }}
          width={screenWidth - 48}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => '#0a7ea4',
            labelColor: () => '#333',
            strokeWidth: 2,
          }}
          bezier
          style={styles.chart}
        />

        <Text style={styles.subHeader}>Recent Network Events</Text>
        <View style={styles.eventList}>
          {[...Array(3)].map((_, idx) => (
            <View key={idx} style={styles.eventCard}>
              <Text style={styles.eventTitle}>Suspicious Login</Text>
              <Text style={styles.eventSub}>IP: 192.168.1.{10 + idx} · Country: NG</Text>
              <Text style={styles.eventMeta}>Flagged by: Network Pattern AI</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.analyzeButton}>
          <Text style={styles.analyzeButtonText}>Analyze Network</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafa',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#0a7ea4',
  },
  scoreContainer: {
    borderWidth: 3,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    width: '100%',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: '#333',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 24,
  },
  eventList: {
    width: '100%',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e65100',
  },
  eventSub: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  eventMeta: {
    fontSize: 12,
    color: '#999',
  },
  analyzeButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
