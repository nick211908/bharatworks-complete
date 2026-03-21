import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // For rupee sign
import api from '../../services/api';
import { PaymentService } from '../../services/PaymentService';
import { Alert } from 'react-native';

/**
 * UI States
 */
type TxState = 'IDLE' | 'ENTER_UPI' | 'SUCCESS';
import COLORS from '../../assets/images/theme/colors';

const Tab = ({
  label,
  icon,
  active,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) => (
  <View style={styles.tab}>
    {icon === '🏠' ? (
      <Feather
        name="home"
        size={20}
        color={active ? COLORS.primary : COLORS.textMuted}
      />
    ) : icon === '🧰' ? (
      <Feather
        name="briefcase"
        size={20}
        color={active ? COLORS.primary : COLORS.textMuted}
      />
    ) : icon === '🙂' ? (
      <FontAwesome5
        name="user-tie"
        size={20}
        color={active ? COLORS.primary : COLORS.textMuted}
      />
    ) : icon === '₹' ? (
      <Feather
        name="dollar-sign"
        size={20}
        color={active ? COLORS.primary : COLORS.textMuted}
      />
    ) : icon === '👤' ? (
      <Feather
        name="user"
        size={20}
        color={active ? COLORS.primary : COLORS.textMuted}
      />
    ) : (
      <Text style={{ color: active ? COLORS.primary : COLORS.textMuted }}>
        {icon}
      </Text>
    )}
    <Text style={[styles.tabLabel, active && { color: COLORS.primary }]}>
      {label}
    </Text>
  </View>
);

export default function LabourEarnings() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const handleLabourHome = () => {
    navigation.replace('LabourHome');
  };
  const handleLabourJobs = () => {
    navigation.replace('LabourAllJobs');
  };

  const handleLabourEarnings = () => {
    navigation.replace('LabourEarnings');
  };
  const handleLabourProfile = () => {
    navigation.replace('LabourProfile');
  };
  const [txState, setTxState] = useState<TxState>('IDLE');
  const [upi, setUpi] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);

  React.useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/wallet/balance');
      setBalance(response.data.balance || 0);
    } catch (e) {
      console.error('Error fetching balance:', e);
    } finally {
      setLoading(false);
    }
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

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Earnings</Text>

      {/* WALLET CARD */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Wallet Balance</Text>
        <Text style={styles.walletAmount}>₹{balance}</Text>

        <View style={styles.walletRow}>
          <Text style={styles.walletSub}>Available: ₹{balance}</Text>
          <Text style={styles.walletSub}>Pending: ₹0</Text>
        </View>
      </View>

      {/* TRANSACTION AREA */}
      {txState === 'IDLE' && (
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => setTxState('ENTER_UPI')}
        >
          <Text style={styles.withdrawText}>Withdraw to UPI</Text>
        </TouchableOpacity>
      )}

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
              setVerifiedName(null); // Reset verification on edit
            }}
          />

          {/* VERIFICATION DISPLAY */}
          {verifiedName && (
            <View
              style={{
                marginTop: 10,
                padding: 8,
                backgroundColor: '#E0F2F1',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#00695C', fontWeight: 'bold' }}>
                ✓ Verified Name: {verifiedName}
              </Text>
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
          <Text style={styles.successAmount}>Payment Request Sent!</Text>
          <Text style={styles.successUpi}>
            Request for ₹{balance} sent to employer.
          </Text>

          <TouchableOpacity
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

      {/* MONTHLY SUMMARY */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryMonth}>September 2023</Text>
          <Text style={styles.summaryToggle}>Monthly</Text>
        </View>

        <Text style={styles.totalEarnings}>₹12,500</Text>
        <Text style={styles.growth}>+12% from last month</Text>

        <View style={styles.metricsRow}>
          <Metric label="Jobs Completed" value="15" />
          <Metric label="Avg. Daily Rate" value="₹720" />
          <Metric label="Working Days" value="18" />
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={handleLabourHome}>
          <Tab label="Home" icon="🏠" active />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLabourJobs}>
          <Tab label="Jobs" icon="🧰" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLabourEarnings}>
          <Tab label="Earnings" icon="₹" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLabourProfile}>
          <Tab label="Profile" icon="👤" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    padding: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  walletCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  walletLabel: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '500',
  },

  walletAmount: {
    color: COLORS.textWhite,
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 8,
  },

  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  walletSub: {
    color: COLORS.textWhite,
    fontSize: 12,
    opacity: 0.9,
  },

  withdrawButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  withdrawText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },

  upiBox: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  upiTitle: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },

  upiInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.disabledBg,
    borderRadius: 8,
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
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  withdrawNowText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },

  successBox: {
    backgroundColor: COLORS.successBg,
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },

  successAmount: {
    color: COLORS.successText,
    fontSize: 20,
    fontWeight: '700',
  },

  successUpi: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  doneText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  summaryToggle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  totalEarnings: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },

  growth: {
    color: COLORS.successText,
    fontSize: 14,
    marginBottom: 16,
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metric: {
    flex: 1,
    alignItems: 'center',
  },

  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
