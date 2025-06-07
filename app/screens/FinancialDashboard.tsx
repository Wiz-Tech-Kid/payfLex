import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SidebarDrawer from '../../components/ui/SidebarDrawer';

const { width } = Dimensions.get('window');

// Custom Progress Bar Component
const ProgressBar = ({ value, style }: { value: number; style?: any }) => (
  <View style={[styles.progressContainer, style]}>
    <View style={[styles.progressFill, { width: `${Math.min(100, value)}%` }]} />
  </View>
);

// Custom Badge Component
const Badge = ({
  children,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'secondary';
  style?: any;
}) => {
  const badgeStyle =
    variant === 'destructive'
      ? styles.badgeDestructive
      : variant === 'secondary'
      ? styles.badgeSecondary
      : styles.badgeDefault;

  return (
    <View style={[badgeStyle, style]}>
      <Text
        style={[
          styles.badgeText,
          variant === 'destructive' ? styles.badgeTextLight : styles.badgeTextDark,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

// Custom Card Component
const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export default function Dashboard({ navigation }: { navigation?: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Simulate API loading delay
      setTimeout(() => {
        setFinancialSummary({
          creditScore: 720,
          totalPaid: 250000,
          activeLoans: 2,
          paymentHistory: {
            onTime: 15,
            failed: 2,
          },
        });

        setCreditHistory([
          {
            id: 1,
            reason: 'payment_made',
            previousScore: 700,
            newScore: 720,
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            reason: 'loan_approved',
            previousScore: 680,
            newScore: 700,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);

        setSavingsGoals([
          {
            id: 1,
            goalName: 'Emergency Fund',
            currentAmount: '75000',
            targetAmount: '100000',
            isCompleted: false,
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);

        setNotifications([
          {
            id: 1,
            title: 'Payment Due',
            message: 'Your loan payment is due in 3 days',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: 'Credit Score Updated',
            message: 'Your credit score has improved to 720',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);

        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleApplyLoan = () => {
    if (navigation) {
      navigation.navigate('Apply');
    }
  };

  const handleMakePayment = () => {
    if (navigation) {
      navigation.navigate('Payment');
    }
  };

  const handleSidebarNav = (route: string) => {
    setSidebarOpen(false);
    if (navigation && navigation.navigate) {
      navigation.navigate(route.replace('/screens/', ''));
    }
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    if (navigation && navigation.replace) {
      navigation.replace('Landing');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Sidebar Drawer */}
      <SidebarDrawer
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNav}
        onLogout={handleLogout}
      />
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Financial Dashboard</Text>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications" size={24} color="white" />
              {unreadNotifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotifications.length}</Text>
                </View>
              )}
            </View>
          </View>

          {financialSummary && (
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Credit Score</Text>
                <Text style={styles.summaryValue}>{financialSummary.creditScore}</Text>
                <View style={styles.summaryTrend}>
                  <Ionicons
                    name={
                      financialSummary.creditScore >= 650 ? 'trending-up' : 'trending-down'
                    }
                    size={16}
                    color={financialSummary.creditScore >= 650 ? '#10B981' : '#EF4444'}
                  />
                  <Text style={styles.summaryTrendText}>
                    {financialSummary.creditScore >= 650 ? 'Good' : 'Fair'}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Paid</Text>
                <Text style={styles.summaryValue}>
                  P{financialSummary.totalPaid.toLocaleString()}
                </Text>
                <Text style={styles.summarySubtext}>
                  {financialSummary.activeLoans} active loans
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Performance */}
        {financialSummary && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>Payment Performance</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>On-time Payments</Text>
                <Badge variant="default">{financialSummary.paymentHistory.onTime}</Badge>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Failed Payments</Text>
                <Badge variant="destructive">{financialSummary.paymentHistory.failed}</Badge>
              </View>
              <View style={styles.progressSection}>
                <Text style={styles.progressTitle}>Payment Success Rate</Text>
                <ProgressBar
                  value={
                    (financialSummary.paymentHistory.onTime /
                      Math.max(
                        1,
                        financialSummary.paymentHistory.onTime +
                          financialSummary.paymentHistory.failed
                      )) *
                    100
                  }
                />
                <Text style={styles.progressText}>
                  {Math.round(
                    (financialSummary.paymentHistory.onTime /
                      Math.max(
                        1,
                        financialSummary.paymentHistory.onTime +
                          financialSummary.paymentHistory.failed
                      )) *
                      100
                  )}
                  % success rate
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Credit Score History */}
        {creditHistory.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={20} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Credit Score Trend</Text>
            </View>
            <View style={styles.cardContent}>
              {creditHistory.slice(0, 5).map((entry) => (
                <View key={entry.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyReason}>
                      {entry.reason
                        .replace('_', ' ')
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <View style={styles.scoreChange}>
                      <Text style={styles.scoreText}>{entry.previousScore}</Text>
                      <Text style={styles.scoreArrow}>→</Text>
                      <Text style={styles.scoreTextNew}>{entry.newScore}</Text>
                    </View>
                    <View style={styles.scoreTrend}>
                      <Ionicons
                        name={
                          entry.newScore > entry.previousScore ? 'trending-up' : 'trending-down'
                        }
                        size={12}
                        color={entry.newScore > entry.previousScore ? '#10B981' : '#EF4444'}
                      />
                      <Text style={styles.scoreDiff}>
                        {entry.newScore > entry.previousScore ? '+' : ''}
                        {entry.newScore - entry.previousScore}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Savings Goals */}
        {savingsGoals.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="flag" size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>Savings Goals</Text>
            </View>
            <View style={styles.cardContent}>
              {savingsGoals.slice(0, 3).map((goal) => {
                const progress =
                  (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
                return (
                  <View key={goal.id} style={styles.goalItem}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalName}>{goal.goalName}</Text>
                      <Badge variant={goal.isCompleted ? 'default' : 'secondary'}>
                        {goal.isCompleted ? 'Completed' : 'In Progress'}
                      </Badge>
                    </View>
                    <ProgressBar value={Math.min(100, progress)} style={styles.goalProgress} />
                    <View style={styles.goalAmounts}>
                      <Text style={styles.goalAmount}>
                        P{parseFloat(goal.currentAmount).toLocaleString()}
                      </Text>
                      <Text style={styles.goalAmount}>
                        P{parseFloat(goal.targetAmount).toLocaleString()}
                      </Text>
                    </View>
                    {goal.targetDate && (
                      <Text style={styles.goalDate}>
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="notifications" size={20} color="#A855F7" />
              <Text style={styles.cardTitle}>Recent Notifications</Text>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" style={styles.headerBadge}>
                  {unreadNotifications.length} new
                </Badge>
              )}
            </View>
            <View style={styles.cardContent}>
              {notifications.slice(0, 5).map((notification) => (
                <View
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    notification.isRead ? styles.notificationRead : styles.notificationUnread,
                  ]}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationDate}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleApplyLoan}>
            <Text style={styles.primaryActionText}>Apply for Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleMakePayment}>
            <Text style={styles.secondaryActionText}>Make Payment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  summaryValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryTrendText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  summarySubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionCard: {
    marginTop: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  cardContent: {
    gap: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1F2937',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyLeft: {
    flex: 1,
  },
  historyReason: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 14,
    color: '#1F2937',
  },
  scoreArrow: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scoreTextNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  scoreTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreDiff: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  goalItem: {
    gap: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  goalProgress: {
    marginVertical: 4,
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  notificationRead: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  notificationUnread: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryActionText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  badgeDefault: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDestructive: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSecondary: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextDark: {
    color: '#1F2937',
  },
  badgeTextLight: {
    color: 'white',
  },
  headerBadge: {
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100, // Space for bottom navigation
  },
});
