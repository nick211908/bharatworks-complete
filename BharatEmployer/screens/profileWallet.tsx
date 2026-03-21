import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import api from '../lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ProfileWalletScreen() {
  const [profile, setProfile] = React.useState<any>(null)
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [amount, setAmount] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    fetchProfile()
    fetchTransactions()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile(response.data.user);
    } catch (e) {
      console.log('Error fetching profile:', e);
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/payment/wallet/transactions');
      setTransactions(response.data.transactions || []);
    } catch (e) {
      console.log('Error fetching transactions:', e);
      setTransactions([]);
    }
  }

  const handleAddMoney = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to add.');
      return;
    }
    try {
      setLoading(true);
      // Create Razorpay order via backend
      const response = await api.post('/payment/wallet/add', { amount: numAmount });
      const order = response.data;
      Alert.alert(
        '✅ Order Created!',
        `Razorpay Order ID: ${order.orderId}\n\nAmount: ₹${numAmount}\n\nOpen your UPI app and pay to this order to top up your wallet.`,
        [{ text: 'OK', onPress: () => { setAmount(''); fetchProfile(); } }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Could not create order';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <Text style={styles.name}>{profile?.name || 'Employer'}</Text>
            <Text style={styles.role}>Owner</Text>
            <Text style={styles.location}>Ram Mandir, Colony</Text>
            <Text style={styles.need}>Daily Need</Text>
          </View>
        </View>

        {/* BALANCE */}
        <View style={styles.balanceBox}>
          <Text style={styles.balance}>₹ {profile?.wallet_balance || '0'}</Text>
          <Text style={styles.growth}>Available Balance</Text>
        </View>

        {/* ADD MONEY VIA RAZORPAY */}
        <View style={styles.addMoneyBox}>
          <Text style={styles.addMoneyLabel}>Add Money to Wallet</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount (₹)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity
            style={[styles.upiButton, loading && { opacity: 0.6 }]}
            onPress={handleAddMoney}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <>
                <Icon name="card-outline" size={20} color="#FFF" />
                <Text style={styles.upiButtonText}>Add Money via Razorpay</Text>
              </>
            }
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.txHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txCard}>
          {transactions.length > 0 ? (
            transactions.map((tx: any) => (
              <Transaction
                key={tx.id}
                type={tx.type}
                time={new Date(tx.created_at).toLocaleString()}
                amount={`${tx.type === 'credit' ? '+' : '-'}₹${tx.amount}`}
                positive={tx.type === 'credit'}
              />
            ))
          ) : (
            <Text style={styles.noTxText}>No transactions yet</Text>
          )}
        </View>

        {/* SETTINGS */}
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingsCard}>
          <SettingRow
            icon="globe-outline"
            label="Language"
            right={<LanguagePill />}
          />

          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            right={<Switch />}
          />

          <SettingRow
            icon="help-circle-outline"
            label="Help & Support"
            arrow
          />

          <SettingRow
            icon="settings-outline"
            label="Account Settings"
            arrow
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={18} color="#1E2C63" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

/* ================= COMPONENTS ================= */

function Transaction({ type, time, amount, positive }: any) {
  return (
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        <View
          style={[
            styles.txIcon,
            { borderColor: positive ? '#4CAF50' : '#F44336' },
          ]}
        >
          <Icon
            name={positive ? 'arrow-down' : 'arrow-up'}
            size={14}
            color={positive ? '#4CAF50' : '#F44336'}
          />
        </View>

        <View>
          <Text style={styles.txType}>{type}</Text>
          <Text style={styles.txTime}>{time}</Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.txAmount}>{amount}</Text>
        <Text style={styles.txMeta}>{positive ? 'Deposit' : 'Send'}</Text>
      </View>
    </View>
  )
}

function SettingRow({ icon, label, right, arrow }: any) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={18} color="#FFF" />
        <Text style={styles.settingText}>{label}</Text>
      </View>

      {right}
      {arrow && <Icon name="chevron-forward" size={18} color="#FFF" />}
    </View>
  )
}

function LanguagePill() {
  return (
    <View style={styles.langPill}>
      <Text style={styles.langText}>English</Text>
      <Text style={styles.langDivider}>|</Text>
      <Text style={styles.langText}>हिंदी</Text>
    </View>
  )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDF8' },

  header: {
    backgroundColor: '#1E2C63',
    borderBottomLeftRadius: 60,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  userInfo: { justifyContent: 'center' },

  name: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  role: { color: '#DADFFF', fontSize: 12 },
  location: { color: '#FFF', fontSize: 12, marginTop: 4 },
  need: { color: '#FF9F1C', fontSize: 12 },

  balanceBox: { padding: 20 },
  balance: { fontSize: 22, fontWeight: '700' },
  growth: { color: '#999', fontSize: 12, marginTop: 4 },

  addMoneyBox: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  addMoneyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#333',
    marginBottom: 10,
  },

  upiButton: {
    marginHorizontal: 20,
    backgroundColor: '#FF9F1C',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },

  upiButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  cardLabel: { fontSize: 12, color: '#777' },
  cardValue: { fontSize: 14, fontWeight: '600' },

  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },

  sectionTitle: { fontSize: 14, fontWeight: '700' },
  seeAll: { fontSize: 12, color: '#FF9F1C' },

  txCard: {
    backgroundColor: '#F4F6FB',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 12,
  },

  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  txLeft: { flexDirection: 'row', gap: 10 },

  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  txType: { fontSize: 13, fontWeight: '600' },
  txTime: { fontSize: 11, color: '#777' },
  txAmount: { fontSize: 13, fontWeight: '700' },
  txMeta: { fontSize: 11, color: '#777' },

  noTxText: { fontSize: 13, color: '#999', textAlign: 'center', paddingVertical: 20 },

  settingsCard: {
    backgroundColor: '#1E2C63',
    margin: 20,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  settingLeft: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  settingText: { color: '#FFF', fontSize: 13 },

  langPill: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    gap: 4,
  },

  langText: { fontSize: 11, color: '#1E2C63' },
  langDivider: { color: '#999', fontSize: 11 },

  logoutBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2C63',
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  logoutText: { fontSize: 14, fontWeight: '600', color: '#1E2C63' },

  tab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFF',
  },

  tabActive: {
    backgroundColor: '#FF9F1C',
    padding: 12,
    borderRadius: 14,
  },
})
