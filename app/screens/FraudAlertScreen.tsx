import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFraudScore } from '../../hooks/useFraudScore';

export default function FraudAlertScreen() {
  const { fraudScore } = useFraudScore();
  const [score, setScore] = useState(fraudScore);

  const refresh = () => {
    setScore(Math.floor(Math.random() * 100));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Fraud Score: {score}</Text>
      {score > 70 ? (
        <View style={[styles.banner, styles.redBanner]}>
          <Text style={styles.bannerText}>High Risk – Some transactions may be blocked</Text>
        </View>
      ) : (
        <View style={[styles.banner, styles.greenBanner]}>
          <Text style={styles.bannerText}>All good</Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={refresh}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  headline: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#0a7ea4',
  },
  banner: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  redBanner: {
    backgroundColor: '#e53935',
  },
  greenBanner: {
    backgroundColor: '#43a047',
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
