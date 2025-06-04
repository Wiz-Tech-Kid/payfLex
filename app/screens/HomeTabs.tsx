import { useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data - replace with your actual data fetching logic
const mockUser = {
  firstName: "John",
  email: "john@example.com",
  phone: "+234 123 456 7890"
};

const mockLoans = [
  {
    id: "1",
    status: "active",
    amount: "500000",
    totalAmount: "600000",
    remainingBalance: "300000",
    monthlyPayment: "50000",
    nextPaymentDate: "2025-07-01",
    termMonths: 12
  }
];

const mockPayments = [
  {
    id: "1",
    paymentMethod: "bank_transfer",
    amount: "50000",
    status: "completed",
    createdAt: "2025-06-01T10:00:00Z"
  },
  {
    id: "2",
    paymentMethod: "mobile_wallet",
    amount: "50000",
    status: "pending",
    createdAt: "2025-05-01T10:00:00Z"
  }
];

export default function Home() {
  // Correct navigation type
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);
  const [loans] = useState(mockLoans);
  const [payments] = useState(mockPayments);

  const activeLoan = loans.find((loan: any) => loan.status === "active");
  const recentPayments = payments.slice(0, 3);

  // Calculate loan progress
  const loanProgress = activeLoan
    ? ((parseFloat(activeLoan.totalAmount) - parseFloat(activeLoan.remainingBalance)) / parseFloat(activeLoan.totalAmount)) * 100
    : 0;

  // Navigation functions
  const navigateToPayment = (loanId?: string) => {
    Alert.alert("Navigation", `Would navigate to payment screen ${loanId ? `for loan ${loanId}` : ''}`);
  };

  const handleUSSDCall = () => {
    const ussdCode = "*737*LOAN*PAY#";
    Linking.openURL(`tel:${ussdCode}`).catch(() =>
      Alert.alert("Error", "Unable to open dialer")
    );
  };

  const ProgressBar = ({ value, style }: { value: number; style?: any }) => (
    <View style={[styles.progressBar, style]}>
      <View style={[styles.progressFill, { width: `${value}%` }]} />
    </View>
  );

  const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) => (
    <View style={[styles.badge, variant === "secondary" ? styles.badgeSecondary : styles.badgeDefault]}>
      <Text style={[styles.badgeText, variant === "secondary" ? styles.badgeTextSecondary : styles.badgeTextDefault]}>
        {children}
      </Text>
    </View>
  );

  // Handle loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {user.firstName || user.email?.split("@")[0] || "User"}
              </Text>
              <Text style={styles.userContact}>{user.phone || user.email}</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.notificationContainer}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationBadge} />
            </View>
            <Text style={styles.menuIcon}>☰</Text>
          </View>
        </View>
        <View style={styles.content}>
          {/* Current Loan Status */}
          {activeLoan ? (
            <View style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <View>
                  <Text style={styles.loanLabel}>Current Loan</Text>
                  <Text style={styles.loanAmount}>
                    ₦{parseFloat(activeLoan.amount).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.carIcon}>🚗</Text>
              </View>
              <View style={styles.loanDetails}>
                <View style={styles.loanDetailItem}>
                  <Text style={styles.loanDetailLabel}>Next Payment</Text>
                  <Text style={styles.loanDetailValue}>
                    ₦{parseFloat(activeLoan.monthlyPayment).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.loanDetailItem}>
                  <Text style={styles.loanDetailLabel}>Due Date</Text>
                  <Text style={styles.loanDetailValue}>
                    {activeLoan.nextPaymentDate
                      ? new Date(activeLoan.nextPaymentDate).toLocaleDateString()
                      : "Completed"
                    }
                  </Text>
                </View>
              </View>
              <ProgressBar value={loanProgress} style={styles.loanProgress} />
              <Text style={styles.loanProgressText}>
                {Math.round(loanProgress)}% paid • {activeLoan.termMonths} months total
              </Text>
            </View>
          ) : (
            <View style={styles.noLoanCard}>
              <Text style={styles.noLoanCarIcon}>🚗</Text>
              <Text style={styles.noLoanTitle}>Ready for your first loan?</Text>
              <Text style={styles.noLoanSubtitle}>
                Get instant approval for auto loans up to ₦2,000,000
              </Text>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.newLoanButton]}
                onPress={() => router.push('/screens/LoanApplication')}
                
              >
                <Text style={styles.plusIcon}>➕</Text>
                <Text style={styles.quickActionText}>New Loan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.paymentButton]}
                onPress={() => navigateToPayment(activeLoan?.id)}
              >
                <Text style={styles.cardIcon}>💳</Text>
                <Text style={styles.quickActionText}>Make Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.newLoanButton]}
                onPress={() => router.push('/screens/LoanApplication')}
              >
                <Text style={styles.plusIcon}>➕</Text>
                <Text style={styles.quickActionText}>New Loan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Options</Text>
            <View style={styles.paymentMethods}>
              <View style={styles.paymentMethod}>
                <Text style={styles.bankIcon}>🏦</Text>
                <Text style={styles.paymentMethodText}>Bank Transfer</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.phoneIcon}>📱</Text>
                <Text style={styles.paymentMethodText}>Mobile Wallet</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.qrIcon}>⬜</Text>
                <Text style={styles.paymentMethodText}>QR Code</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.ussdIcon}>☎️</Text>
                <Text style={styles.paymentMethodText}>USSD</Text>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          {recentPayments.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Payments</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {recentPayments.map((payment: any) => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentLeft}>
                    <View style={[
                      styles.paymentIcon,
                      payment.status === "completed" ? styles.paymentIconSuccess : styles.paymentIconDefault
                    ]}>
                      <Text style={styles.cardIcon}>💳</Text>
                    </View>
                    <View>
                      <Text style={styles.paymentMethodText}>
                        {payment.paymentMethod.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={[
                      styles.paymentAmount,
                      payment.status === "completed" ? styles.paymentAmountSuccess : styles.paymentAmountDefault
                    ]}>
                      ₦{parseFloat(payment.amount).toLocaleString()}
                    </Text>
                    <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Loan Calculator - Mock component */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loan Calculator</Text>
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorText}>Calculate your loan payments</Text>
              <TouchableOpacity style={styles.calculatorButton}>
                <Text style={styles.calculatorButtonText}>Open Calculator</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* USSD Demo */}
          <View style={styles.ussdCard}>
            <Text style={styles.ussdTitle}>Pay via USSD</Text>
            <Text style={styles.ussdSubtitle}>Dial from any phone, no internet required</Text>
            <View style={styles.ussdCode}>
              <Text style={styles.ussdCodeText}>*737*LOAN*PAY#</Text>
            </View>
            <TouchableOpacity style={styles.ussdButton} onPress={handleUSSDCall}>
              <Text style={styles.ussdButtonText}>Try USSD Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Bottom Navigation - Mock component */}
      <View style={styles.bottomNav}>
        <Text style={styles.bottomNavText}>🏠 Home</Text>
        <Text style={styles.bottomNavText}>📊 Loans</Text>
        <Text style={styles.bottomNavText}>💳 Payments</Text>
        <Text style={styles.bottomNavText}>👤 Profile</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  userContact: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  loanCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loanLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  loanAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loanDetailItem: {
    flex: 1,
  },
  loanDetailLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  loanDetailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loanProgress: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  loanProgressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  noLoanCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  noLoanIcon: {
    marginBottom: 16,
  },
  noLoanTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noLoanSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  paymentButton: {
    backgroundColor: '#10B981',
  },
  newLoanButton: {
    backgroundColor: '#007AFF',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  paymentIconDefault: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentAmountSuccess: {
    color: '#10B981',
  },
  paymentAmountDefault: {
    color: '#9CA3AF',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeDefault: {
    backgroundColor: '#007AFF',
  },
  badgeSecondary: {
    backgroundColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  badgeTextDefault: {
    color: 'white',
  },
  badgeTextSecondary: {
    color: '#6B7280',
  },
  ussdCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 24,
  },
  ussdTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ussdSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  ussdCode: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  ussdCodeText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  ussdButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ussdButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  // Icon styles
  bellIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  menuIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  carIcon: {
    fontSize: 48,
  },
  noLoanCarIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  plusIcon: {
    fontSize: 24,
  },
  bankIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  phoneIcon: {
    fontSize: 24,
    color: '#10B981',
  },
  qrIcon: {
    fontSize: 24,
    color: '#F59E0B',
  },
  ussdIcon: {
    fontSize: 24,
    color: '#8B5CF6',
  },
  // Calculator styles
  calculatorCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  calculatorText: {
    fontSize: 14,
    color: '#6B7280',
  },
  calculatorButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  calculatorButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  // Bottom navigation styles
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  }
});