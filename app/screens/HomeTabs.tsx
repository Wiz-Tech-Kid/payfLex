import { useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SidebarDrawer from '../../components/ui/SidebarDrawer';

// Mock data - replace with your actual data fetching logic
const mockUser = {
  firstName: "John",
  email: "john@example.com",
  phone: "+26771234567"
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
  const router = useRouter();
  const [user] = useState(mockUser);
  const [isLoading] = useState(false);
  const [loans] = useState(mockLoans);
  const [payments] = useState(mockPayments);
  // Sidebar (Drawer) state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLoan = loans.find((loan: any) => loan.status === "active");
  const recentPayments = payments.slice(0, 3);

  // Calculate loan progress
  const loanProgress = activeLoan
    ? ((parseFloat(activeLoan.totalAmount) - parseFloat(activeLoan.remainingBalance)) / parseFloat(activeLoan.totalAmount)) * 100
    : 0;

  // Navigation handlers
  const handleMakePayment = () => {
    router.push('/screens/SendMoneyScreen');
  };
  const handleNewLoan = () => {
    router.push('/screens/LoanApplication');
  };
  const handleLoanCalculator = () => {
    router.push('/screens/SimulatorScreen');
  };
  const handleRecentPayments = () => {
    router.push('/screens/SendMoneyScreen'); // adjust if you have a payments screen
  };
  const handleUSSDCall = () => {
    const ussdCode = "*737*LOAN*PAY#";
    Linking.openURL(`tel:${ussdCode}`).catch(() =>
      alert("Unable to open dialer")
    );
  };
  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    router.push(route as any);
  };
  const handleLogout = () => {
    setSidebarOpen(false);
    router.replace('/screens/Landing');
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
      {/* Sidebar Drawer */}
      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNav}
        onLogout={handleLogout}
      />
      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
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
            <TouchableOpacity onPress={() => setSidebarOpen(true)}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
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
                    P{parseFloat(activeLoan.amount).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.carIcon}>🚗</Text>
              </View>
              <View style={styles.loanDetails}>
                <View style={styles.loanDetailItem}>
                  <Text style={styles.loanDetailLabel}>Next Payment</Text>
                  <Text style={styles.loanDetailValue}>
                    P{parseFloat(activeLoan.monthlyPayment).toLocaleString()}
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
                Get instant approval for auto loans up to P2,000,000
              </Text>
            <TouchableOpacity 
  style={[styles.quickActionCard, styles.newLoanCard]} // Changed from quickActionButton and newLoanButton
  onPress={handleNewLoan}
>
  <View style={styles.quickActionIconContainer}>
    <Text style={styles.quickActionIcon}>➕</Text>
  </View>
  <Text style={styles.quickActionTitle}>New Loan</Text> {/* Changed from quickActionText */}
</TouchableOpacity>

            </View>
          )}

          {/* Quick Actions */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Quick Actions</Text>
  <View style={styles.quickActionsGrid}>
    <TouchableOpacity
      style={[styles.quickActionCard, styles.paymentCard]}
      onPress={handleMakePayment}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionIconContainer}>
        <Text style={styles.quickActionIcon}>💳</Text>
      </View>
      <Text style={styles.quickActionTitle}>Make Payment</Text>
      <Text style={styles.quickActionSubtitle}>Pay your loan instantly</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.quickActionCard, styles.newLoanCard]}
      onPress={handleNewLoan}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionIconContainer}>
        <Text style={styles.quickActionIcon}>🚗</Text>
      </View>
      <Text style={styles.quickActionTitle}>New Loan</Text>
      <Text style={styles.quickActionSubtitle}>Apply for auto financing</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.quickActionCard, styles.calculatorCard]}
      onPress={handleLoanCalculator}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionIconContainer}>
        <Text style={styles.quickActionIcon}>🧮</Text>
      </View>
      <Text style={styles.quickActionTitle}>Calculator</Text>
      <Text style={styles.quickActionSubtitle}>Estimate your payments</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.quickActionCard, styles.digitalIdCard]}
      onPress={() => router.push('/screens/DigitalIDScreen')}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionIconContainer}>
        <Text style={styles.quickActionIcon}>🆔</Text>
      </View>
      <Text style={styles.quickActionTitle}>Digital ID</Text>
      <Text style={styles.quickActionSubtitle}>View your profile</Text>
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
                <TouchableOpacity onPress={handleRecentPayments}>
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
                        {new Date(payment.createdAt).toLocaleDateString()
                        }
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={[
                      styles.paymentAmount,
                      payment.status === "completed" ? styles.paymentAmountSuccess : styles.paymentAmountDefault
                    ]}>
                      P{parseFloat(payment.amount).toLocaleString()}
                    </Text>
                    <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </View>
                </View>
              ))}
            </View>
          )}

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
      {/* Removed mock bottom navigation */}
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
 
  calculatorText: {
    fontSize: 14,
    color: '#6B7280',
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
  },
  // Sidebar (Drawer) styles
  sidebarOverlay: {
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
  sidebarDrawer: {
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
  sidebarCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  sidebarCloseIcon: {
    fontSize: 28,
    color: '#6B7280',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    color: '#007AFF',
  },
  sidebarLink: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sidebarLinkText: {
    fontSize: 16,
    color: '#1F2937',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  sidebarLogoutBtn: {
    paddingVertical: 14,
  },
  sidebarLogoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%', // Two cards per row with gap
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
  paymentCard: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  newLoanCard: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC',
  },
  calculatorCard: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  digitalIdCard: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
});