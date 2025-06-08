import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const { width, height } = Dimensions.get('window');
const QR_SIZE = width * 0.6;

function generateRandomDid() {
  return 'did:bw:' + Math.random().toString(36).substring(2, 15);
}

export default function QRCodeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 5 minutes in seconds
  const [timer, setTimer] = useState(300);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);

  // Request camera *permission* is removed, since we won't actually use it.
  // useEffect(() => { … }, []);

  // Countdown timer for QR expiration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (qrValue) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setQrValue(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [qrValue]);

  // Generate a dummy DID-based QR
  const generateQr = () => {
    const did = generateRandomDid();
    setQrValue(did);
    setTimer(300);
    setScannedData(null);
  };

  // Simulate scanning by simply "reading" the current QR value
  const simulateScan = () => {
    if (qrValue) {
      setScannedData(qrValue);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#fff' }]}
    >
      <Text style={[styles.header, { color: isDark ? 'white' : '#111827' }]}>
        QR Code Payment
      </Text>

      <View style={styles.content}>
        {/* QR GENERATOR */}
        <View style={styles.generatorSection}>
          {qrValue ? (
            <>
              <QRCode
                value={qrValue}
                size={QR_SIZE}
                color={isDark ? 'white' : 'black'}
                backgroundColor={isDark ? '#0f172a' : 'white'}
              />
              <Text
                style={[
                  styles.timerText,
                  { color: isDark ? '#a5b4fc' : '#7c3aed' },
                ]}
              >
                Expires in:{' '}
                {Math.floor(timer / 60)
                  .toString()
                  .padStart(2, '0')}
                :
                {(timer % 60).toString().padStart(2, '0')}
              </Text>
            </>
          ) : (
            <TouchableOpacity style={styles.qrButton} onPress={generateQr}>
              <Ionicons name="qr-code-outline" size={40} color="white" />
              <Text style={styles.qrButtonText}>Generate QR</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* QR “SCANNER” Placeholder */}
        <View style={styles.scannerSection}>
          <View
            style={[
              styles.scannerPlaceholder,
              { backgroundColor: isDark ? '#1e293b' : '#f3f4f6' },
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={64}
              color={isDark ? '#6b7280' : '#9ca3af'}
            />
            <Text style={[styles.placeholderText, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
              Camera Preview Placeholder
            </Text>
          </View>

          {/* Simulate a scan */}
          {qrValue && !scannedData && (
            <TouchableOpacity style={styles.simButton} onPress={simulateScan}>
              <Ionicons name="scan-outline" size={28} color="white" />
              <Text style={styles.simButtonText}>Simulate Scan</Text>
            </TouchableOpacity>
          )}

          {/* Show scanned data */}
          {scannedData && (
            <View style={styles.scannedResult}>
              <Text
                style={[
                  styles.resultLabel,
                  { color: isDark ? 'white' : '#111827' },
                ]}
              >
                Scanned DID:
              </Text>
              <Text style={{ color: isDark ? '#a5b4fc' : '#7c3aed' }}>
                {scannedData}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },
  content: {
    flex: 1,
    flexDirection: width > 600 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
  },
  generatorSection: {
    alignItems: 'center',
    marginBottom: width > 600 ? 0 : 24,
  },
  qrButton: {
    backgroundColor: '#7c3aed',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  qrButtonText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  timerText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  scannerSection: {
    width: width > 600 ? '45%' : '100%',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
  },
  scannerPlaceholder: {
    width: '100%',
    height: width > 600 ? height * 0.6 : height * 0.3,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c4b5fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  simButton: {
    marginTop: 16,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  simButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  scannedResult: {
    marginTop: 16,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});
