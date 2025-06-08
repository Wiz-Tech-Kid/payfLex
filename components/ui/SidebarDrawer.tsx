import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export default function SidebarDrawer({ visible, onClose, onNavigate, onLogout }: SidebarDrawerProps) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity style={styles.link} onPress={() => onNavigate('HomeTabs')}>
          <Text style={styles.linkText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => onNavigate('FinancialDashboard')}>
          <Text style={styles.linkText}>📊 Financial Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => onNavigate('FraudAlertScreen')}>
          <Text style={styles.linkText}>🚨 Fraud Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => onNavigate('SendMoneyScreen')}>
          <Text style={styles.linkText}>💳 Make Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => onNavigate('DigitalIDScreen')}>
          <Text style={styles.linkText}>🆔 Digital ID / Profile</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  drawer: {
    width: 270,
    maxWidth: '80%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  closeIcon: {
    fontSize: 28,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    color: '#007AFF',
  },
  link: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkText: {
    fontSize: 16,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  logoutBtn: {
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
