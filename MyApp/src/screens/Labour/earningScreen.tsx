import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';
import { PaymentService } from '../../services/PaymentService';
import { Alert } from 'react-native';
import COLORS from '../../assets/images/theme/colors';
import LabourBottomNav from '../../components/LabourBottomNav';

type TxState = 'IDLE' | 'ENTER_UPI' | 'SUCCESS';
type TabType = 'overview' | 'history';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit' | 'pending';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface EarningsSummary {
  totalEarned: number;
  totalJobs: number;
  avgDailyRate: number;
  workingDays: number;
  monthlyGrowth: number;
}



export default function LabourEarnings() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [txState, setTxState] = useState<TxState>('IDLE');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [upi, setUpi] = useState('');
  const [balance, setBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = async () => {
    try {
      // Fetch wallet balance
      const balanceRes = await api.get('/wallet/balance');
      setBalance(balanceRes.data.balance || 0);
      setPendingAmount(balanceRes.data.pending || 0);

      // Fetch earnings summary
      const summaryRes = await api.get('/earnings/summary');
      setSummary(summaryRes.data);

      // Fetch transaction history
      const txRes = await api.get('/earnings/transactions');
      setTransactions(txRes.data.transactions || []);
    } catch (e) {
      console.error('Error fetching earnings data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };



  const handleVerifyUpi = async () => {
    setLoading(true);
    setVerifiedName(null);
    try {
      const result = await PaymentService.verifyUpiId(upi);
      if (result.isValid) {
        setVerifiedName(result.name || 'Verified ID');
      } else {
        Alert.alert('Verification Failed', result.message || 'Invalid UPI ID');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not verify UPI ID');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRequest = async () => {
    const amountToWithdraw = balance > 0 ? balance : 0;
    if (amountToWithdraw <= 0) {
      Alert.alert('Error', 'No funds to request.');
      return;
    }
    try {
      await api.post('/wallet/payout-request', { amount: amountToWithdraw, upiId: upi });
      setTxState('SUCCESS');
    } catch (error: any) {
      Alert.alert('Request Failed', error.response?.data?.error || error.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderOverview = () => (
    <>
      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <View>
            <Text style={styles.walletLabel}>Total Balance</Text>
            <Text style={styles.walletAmount}>₹{balance.toLocaleString()}</Text>
          </View>
          <View style={styles.walletIcon}>
            <MaterialIcons name="account-balance-wallet" size={32} color="#FFF" />
          </View>
        </View>

        <View style={styles.walletStats}>
          <View style={styles.walletStat}>
            <Text style={styles.walletStatLabel}>Available</Text>
            <Text style={styles.walletStatValue}>₹{balance.toLocaleString()}</Text>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletStat}>
            <Text style={styles.walletStatLabel}>Pending</Text>
            <Text style={styles.walletStatValue}>₹{pendingAmount.toLocaleString()}</Text>
          </View>
        </View>

        {txState === 'IDLE' && (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => setTxState('ENTER_UPI')}
          >
            <Feather name="upload" size={18} color="#FFF" />
            <Text style={styles.withdrawText}>Withdraw to UPI</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transaction Area */}
      {txState === 'ENTER_UPI' && (
        <View style={styles.upiBox}>
          <Text style={styles.upiTitle}>Enter UPI ID</Text>
          <TextInput
            style={styles.upiInput}
            placeholder="yourname@upi"
            placeholderTextColor="#9AA3B2"
            value={upi}
            onChangeText={text => {
              setUpi(text);
              setVerifiedName(null);
            }}
          />
          {verifiedName && (
            <View style={styles.verifiedBox}>
              <MaterialIcons name="verified-user" size={18} color="#00695C" />
              <Text style={styles.verifiedText}>Verified: {verifiedName}</Text>
            </View>
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setUpi('');
                setVerifiedName(null);
                setTxState('IDLE');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            {!verifiedName ? (
              <TouchableOpacity
                disabled={!upi}
                style={[styles.withdrawNowBtn, !upi && { opacity: 0.5 }]}
                onPress={handleVerifyUpi}
              >
                <Text style={styles.withdrawNowText}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.withdrawNowBtn}
                onPress={handlePaymentRequest}
              >
                <Text style={styles.withdrawNowText}>Send Request</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {txState === 'SUCCESS' && (
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Request Sent!</Text>
          <Text style={styles.successUpi}>
            ₹{balance} will be transferred to your UPI
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              setUpi('');
              setVerifiedName(null);
              setTxState('IDLE');
            }}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Earnings Summary */}
      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>This Month</Text>
            <View style={styles.growthBadge}>
              <Feather name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.growthText}>+{summary.monthlyGrowth}%</Text>
            </View>
          </View>
          <Text style={styles.totalEarnings}>₹{summary.totalEarned.toLocaleString()}</Text>
          <Text style={styles.earningsLabel}>Total Earnings</Text>

          <View style={styles.metricsRow}>
            <MetricCard
              icon="briefcase"
              label="Jobs Done"
              value={summary.totalJobs.toString()}
            />
            <MetricCard
              icon="calendar"
              label="Work Days"
              value={summary.workingDays.toString()}
            />
            <MetricCard
              icon="rupee-sign"
              label="Daily Avg"
              value={`₹${summary.avgDailyRate}`}
            />
          </View>
        </View>
      )}
    </>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Recent Transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="receipt-long" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Your earnings will appear here</Text>
        </View>
      ) : (
        transactions.map((tx) => (
          <View key={tx.id} style={styles.transactionCard}>
            <View style={styles.transactionIcon}>
              <MaterialIcons
                name={tx.type === 'credit' ? 'arrow-downward' : tx.type === 'debit' ? 'arrow-upward' : 'schedule'}
                size={20}
                color={tx.type === 'credit' ? COLORS.success : tx.type === 'debit' ? COLORS.error : COLORS.warning}
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>{tx.description}</Text>
              <Text style={styles.transactionDate}>{tx.date}</Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.amountText,
                tx.type === 'credit' ? styles.creditAmount :
                tx.type === 'debit' ? styles.debitAmount : styles.pendingAmount
              ]}>
                {tx.type === 'credit' ? '+' : tx.type === 'debit' ? '-' : ''}₹{tx.amount}
              </Text>
              <View style={[
                styles.statusBadge,
                tx.status === 'completed' ? styles.completedBadge :
                tx.status === 'pending' ? styles.pendingBadge : styles.failedBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  tx.status === 'completed' ? styles.completedText :
                  tx.status === 'pending' ? styles.pendingText : styles.failedText
                ]}>
                  {tx.status}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.headerTitle}>Your Earnings</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Feather name="help-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.tabButtonTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          activeTab === 'overview' ? renderOverview() : renderHistory()
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <LabourBottomNav activeTab="Earnings" />
    </SafeAreaView>
  );
}

function MetricCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <FontAwesome5 name={icon} size={16} color={COLORS.primary} style={styles.metricIcon} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  helpButton: {
    padding: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  tabSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loader: {
    paddingVertical: 60,
  },
  walletCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  walletAmount: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  walletStat: {
    flex: 1,
  },
  walletDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  walletStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  walletStatValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  withdrawText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  upiBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  upiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  upiInput: {
    backgroundColor: COLORS.screenBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.successBg,
    borderRadius: 10,
    gap: 8,
  },
  verifiedText: {
    color: COLORS.successText,
    fontWeight: '600',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.disabledBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawNowBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  withdrawNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successUpi: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  doneText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  totalEarnings: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  earningsLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  historyContainer: {
    paddingTop: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.screenBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  creditAmount: {
    color: COLORS.success,
  },
  debitAmount: {
    color: COLORS.error,
  },
  pendingAmount: {
    color: COLORS.warning,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: COLORS.successBg,
  },
  pendingBadge: {
    backgroundColor: COLORS.warningBg,
  },
  failedBadge: {
    backgroundColor: COLORS.errorBg,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  completedText: {
    color: COLORS.success,
  },
  pendingText: {
    color: COLORS.warning,
  },
  failedText: {
    color: COLORS.error,
  },
});
