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
  Modal,
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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

  interface PendingDue {
    employerId: string;
    companyName: string;
    amount: number;
  }
  const [pendingDues, setPendingDues] = useState<PendingDue[]>([]);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [requestingPaymentFor, setRequestingPaymentFor] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch wallet balance
      const balanceRes = await api.get('/wallet/balance');
      setBalance(balanceRes.data.balance || 0);
      setPendingAmount(balanceRes.data.pending || 0);

      // Fetch pending dues breakdown
      const pendingRes = await api.get('/earnings/pending');
      setPendingDues(pendingRes.data.pendingDues || []);

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
        Alert.alert(t('common.error'), result.message || 'Invalid UPI ID');
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Could not verify UPI ID');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRequest = async () => {
    const amountToWithdraw = balance > 0 ? balance : 0;
    if (amountToWithdraw <= 0) {
      Alert.alert(t('common.error'), 'No funds to request.');
      return;
    }
    try {
      await api.post('/wallet/payout-request', { amount: amountToWithdraw, upiId: upi });
      setTxState('SUCCESS');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.error || error.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('labour.goodMorning');
    if (hour < 17) return t('labour.goodAfternoon');
    return t('labour.goodEvening');
  };

  const renderOverview = () => (
    <>
      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <View>
            <Text style={styles.walletLabel}>{t('labour.totalBalance')}</Text>
            <Text style={styles.walletAmount}>₹{balance.toLocaleString()}</Text>
          </View>
          <View style={styles.walletIcon}>
            <MaterialIcons name="account-balance-wallet" size={32} color="#FFF" />
          </View>
        </View>

        <View style={styles.walletStats}>
          <View style={styles.walletStat}>
            <Text style={styles.walletStatLabel}>{t('labour.available')}</Text>
            <Text style={styles.walletStatValue}>₹{balance.toLocaleString()}</Text>
          </View>
          <View style={styles.walletDivider} />
          <TouchableOpacity 
            style={styles.walletStat} 
            onPress={() => setPendingModalVisible(true)}
            disabled={pendingAmount <= 0}
          >
            <Text style={styles.walletStatLabel}>{t('labour.pending')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.walletStatValue, pendingAmount > 0 && { textDecorationLine: 'underline' }]}>
                ₹{pendingAmount.toLocaleString()}
              </Text>
              {pendingAmount > 0 && <Feather name="chevron-right" size={16} color="#FFF" />}
            </View>
          </TouchableOpacity>
        </View>

        {txState === 'IDLE' && (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => setTxState('ENTER_UPI')}
          >
            <Feather name="upload" size={18} color="#FFF" />
            <Text style={styles.withdrawText}>{t('labour.withdrawToUpi')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transaction Area */}
      {txState === 'ENTER_UPI' && (
        <View style={styles.upiBox}>
          <Text style={styles.upiTitle}>{t('labour.enterUpiId')}</Text>
          <TextInput
            style={styles.upiInput}
            placeholder={t('labour.upiPlaceholder')}
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
              <Text style={styles.verifiedText}>{t('labour.verifiedAs', { name: verifiedName })}</Text>
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
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            {!verifiedName ? (
              <TouchableOpacity
                disabled={!upi}
                style={[styles.withdrawNowBtn, !upi && { opacity: 0.5 }]}
                onPress={handleVerifyUpi}
              >
                <Text style={styles.withdrawNowText}>
                  {loading ? t('labour.verifying') : t('common.confirm')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.withdrawNowBtn}
                onPress={handlePaymentRequest}
              >
                <Text style={styles.withdrawNowText}>{t('labour.sendRequest')}</Text>
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
          <Text style={styles.successTitle}>{t('labour.requestSent')}</Text>
          <Text style={styles.successUpi}>
            {t('labour.transferMsg', { amount: balance })}
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              setUpi('');
              setVerifiedName(null);
              setTxState('IDLE');
            }}
          >
            <Text style={styles.doneText}>{t('labour.done')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Earnings Summary */}
      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{t('labour.thisMonth')}</Text>
            <View style={styles.growthBadge}>
              <Feather name="trending-up" size={12} color={COLORS.success} />
              <Text style={styles.growthText}>+{summary.monthlyGrowth}%</Text>
            </View>
          </View>
          <Text style={styles.totalEarnings}>₹{summary.totalEarned.toLocaleString()}</Text>
          <Text style={styles.earningsLabel}>{t('labour.totalEarnings')}</Text>

          <View style={styles.metricsRow}>
            <MetricCard
              icon="briefcase"
              label={t('labour.jobsDone')}
              value={summary.totalJobs.toString()}
            />
            <MetricCard
              icon="calendar"
              label={t('labour.workDays')}
              value={summary.workingDays.toString()}
            />
            <MetricCard
              icon="rupee-sign"
              label={t('labour.dailyAvg')}
              value={`₹${summary.avgDailyRate}`}
            />
          </View>
        </View>
      )}
    </>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>{t('labour.recentTransactions')}</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="receipt-long" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{t('labour.noTransactions')}</Text>
          <Text style={styles.emptySubtext}>{t('labour.earningsAppearHere')}</Text>
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
          <Text style={styles.headerTitle}>{t('labour.yourEarnings')}</Text>
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
            {t('labour.overview')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>
            {t('labour.history')}
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

      {/* Pending Dues Modal */}
      <Modal
        visible={pendingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPendingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('labour.pendingDues')}</Text>
              <TouchableOpacity onPress={() => setPendingModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {pendingDues.length === 0 ? (
                <Text style={styles.emptyText}>{t('labour.noPendingDues')}</Text>
              ) : (
                pendingDues.map((due) => (
                  <View key={due.employerId} style={styles.dueItem}>
                    <View style={styles.dueInfo}>
                      <Text style={styles.dueCompany}>{due.companyName}</Text>
                      <Text style={styles.dueAmount}>₹{due.amount.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.requestBtn, requestingPaymentFor === due.employerId && { opacity: 0.7 }]}
                      disabled={requestingPaymentFor === due.employerId}
                      onPress={async () => {
                        setRequestingPaymentFor(due.employerId);
                        try {
                          await api.post('/earnings/request-payment', {
                            employerId: due.employerId,
                            amount: due.amount
                          });
                          Alert.alert(t('common.success'), t('labour.requestPaymentTo', { name: due.companyName }));
                        } catch (err: any) {
                          Alert.alert(t('common.error'), err.response?.data?.error || t('labour.failedToSendRequest'));
                        } finally {
                          setRequestingPaymentFor(null);
                        }
                      }}
                    >
                      <Text style={styles.requestBtnText}>
                        {requestingPaymentFor === due.employerId ? t('common.loading') : t('labour.requestPayment')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
    color: COLORS.textMuted,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.screenBg,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
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
    paddingVertical: 2,
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
    fontWeight: '600',
    textTransform: 'capitalize',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBody: {
    marginBottom: 20,
  },
  dueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.screenBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dueInfo: {
    flex: 1,
  },
  dueCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dueAmount: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '700',
  },
  requestBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  requestBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  metricIcon: {
    marginBottom: 8,
  },
});
