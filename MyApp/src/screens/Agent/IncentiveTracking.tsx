import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const IncentiveTracking = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'history'>('wallet');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>इंसेंटिव ट्रैकिंग</Text>
        <Text style={styles.headerSubtitle}>Incentive Tracking</Text>

        {/* TABS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'wallet' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('wallet')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'wallet' && styles.activeTabText,
              ]}
            >
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'history' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.activeTabText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'wallet' ? (
          <>
            {/* TOTAL EARNINGS */}
            <View style={styles.totalEarningsCard}>
              <Text style={styles.cardTitle}>
                कुल कमाई / Total Earnings
              </Text>
              <Text style={styles.amount}>₹8,450</Text>
              <Text style={styles.growth}>↗ +15% this month</Text>
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.rewardCard]}>
                <Text style={styles.statValue}>450</Text>
                <Text style={styles.statLabel}>Reward Points</Text>
              </View>

              <View style={[styles.statCard, styles.monthCard]}>
                <Text style={styles.statValueGreen}>₹825</Text>
                <Text style={styles.statLabelGreen}>This Month</Text>
              </View>
            </View>

            {/* PENDING PAYOUT */}
            <View style={styles.pendingCard}>
              <Text style={styles.pendingTitle}>
                पेंडिंग / Pending Payout
              </Text>
              <Text style={styles.pendingAmount}>₹300</Text>
              <Text style={styles.pendingNote}>
                Will be processed in next payout cycle
              </Text>
            </View>

            {/* MOTIVATION */}
            <View style={styles.motivationCard}>
              <Text style={styles.motivationTitle}>
                Keep Growing! 🎉
              </Text>
              <Text style={styles.motivationText}>
                Onboard more workers to increase your earnings and trust level
              </Text>
            </View>

            {/* EARNING RATES */}
            <View style={styles.rateCard}>
              <Text style={styles.rateTitle}>Earning Rates</Text>

              <View style={styles.rateRow}>
                <Text>Per verified worker</Text>
                <Text>₹25</Text>
              </View>

              <View style={styles.rateRow}>
                <Text>Bonus (Gold Agent)</Text>
                <Text>+25%</Text>
              </View>

              <View style={styles.rateRow}>
                <Text>Referral bonus</Text>
                <Text>₹50</Text>
              </View>
            </View>

            {/* WITHDRAW */}
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => {
                // placeholder function
              }}
            >
              <Text style={styles.withdrawText}>Withdraw Earnings</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* HISTORY PLACEHOLDER */
          <View style={styles.historyPlaceholder}>
            <Text style={styles.historyText}>
              History content will be added here
            </Text>
          </View>
        )}

        {activeTab === 'history' && (
  <ScrollView contentContainerStyle={styles.scrollContent}>

    {/* TRANSACTION SUMMARY */}
    <View style={styles.historySummaryCard}>
      <Text style={styles.historyTitle}>Transaction History</Text>
      <Text style={styles.historySubtitle}>Last 30 days</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Transactions</Text>
          <Text style={styles.summaryValue}>4</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Paid</Text>
          <Text style={styles.summaryValue}>₹825</Text>
        </View>
      </View>
    </View>

    {/* PENDING TRANSACTION */}
    <View style={styles.historyCardPending}>
      <View style={styles.historyRow}>
        <Text style={styles.historyCardTitle}>
          Workers onboarded today
        </Text>
        <Text style={styles.amountText}>₹30</Text>
      </View>

      <Text style={styles.subText}>12 workers</Text>
      <Text style={styles.dateText}>6 Dec 2025</Text>

      <View style={styles.pendingBadge}>
        <Text style={styles.pendingText}>⏰ Pending</Text>
      </View>
    </View>

    {/* PAID TRANSACTION 1 */}
    <View style={styles.historyCardPaid}>
      <View style={styles.historyRow}>
        <Text style={styles.historyCardTitle}>
          Workers verified & paid
        </Text>
        <Text style={styles.amountText}>₹20</Text>
      </View>

      <Text style={styles.subText}>8 workers</Text>
      <Text style={styles.dateText}>5 Dec 2025</Text>

      <View style={styles.paidBadge}>
        <Text style={styles.paidText}>✔ Paid</Text>
      </View>

      <View style={styles.creditBox}>
        <Text style={styles.creditText}>
          ✔ Credited to bank account
        </Text>
      </View>
    </View>

    {/* PAID TRANSACTION 2 */}
    <View style={styles.historyCardPaid}>
      <View style={styles.historyRow}>
        <Text style={styles.historyCardTitle}>
          Workers verified & paid
        </Text>
        <Text style={styles.amountText}>₹37</Text>
      </View>

      <Text style={styles.subText}>15 workers</Text>
      <Text style={styles.dateText}>4 Dec 2025</Text>

      <View style={styles.paidBadge}>
        <Text style={styles.paidText}>✔ Paid</Text>
      </View>

      <View style={styles.creditBox}>
        <Text style={styles.creditText}>
          ✔ Credited to bank account
        </Text>
      </View>
    </View>

    {/* PAID TRANSACTION 3 */}
    <View style={styles.historyCardPaid}>
      <View style={styles.historyRow}>
        <Text style={styles.historyCardTitle}>
          Workers verified & paid
        </Text>
        <Text style={styles.amountText}>₹25</Text>
      </View>

      <Text style={styles.subText}>10 workers</Text>
      <Text style={styles.dateText}>3 Dec 2025</Text>

      <View style={styles.paidBadge}>
        <Text style={styles.paidText}>✔ Paid</Text>
      </View>

      <View style={styles.creditBox}>
        <Text style={styles.creditText}>
          ✔ Credited to bank account
        </Text>
      </View>
    </View>

  </ScrollView>
)}

      </ScrollView>
    </SafeAreaView>
  );
};

export default IncentiveTracking;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    backgroundColor: '#FF9F1C',
    padding: 20,
    paddingBottom: 30,
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },

  headerSubtitle: {
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 14,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FF9F1C',
    borderRadius: 20,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#FFF',
  },

  tabText: {
    color: '#FFF',
    fontWeight: '500',
  },

  activeTabText: {
    color: '#7A2EFF',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  totalEarningsCard: {
    backgroundColor: '#2C336D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    color: '#FFF',
    marginBottom: 6,
  },

  amount: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },

  growth: {
    color: '#D1D6FF',
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },

  rewardCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFD36A',
  },

  monthCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#8FE0B0',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9F1C',
  },

  statLabel: {
    color: '#FF9F1C',
  },

  statValueGreen: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1EAD5A',
  },

  statLabelGreen: {
    color: '#1EAD5A',
  },

  pendingCard: {
    backgroundColor: '#FF6A00',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  pendingTitle: {
    color: '#FFF',
    marginBottom: 4,
  },

  pendingAmount: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },

  pendingNote: {
    color: '#FFE6CC',
    marginTop: 6,
  },

  motivationCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },

  motivationText: {
    color: '#555',
  },

  rateCard: {
    backgroundColor: '#EAF3FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  rateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  withdrawButton: {
    backgroundColor: '#FF9F1C',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
  },

  withdrawText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  historyPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  historyText: {
    color: '#888',
  },

  historySummaryCard: {
  backgroundColor: '#2C336D',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
},

historyTitle: {
  color: '#FFF',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 6,
},

historySubtitle: {
  color: '#D1D6FF',
  marginBottom: 16,
},

summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

summaryBox: {
  backgroundColor: '#5B628E',
  borderRadius: 12,
  padding: 14,
  width: '48%',
},

summaryLabel: {
  color: '#E0E3FF',
  marginBottom: 4,
},

summaryValue: {
  color: '#FFF',
  fontSize: 18,
  fontWeight: '700',
},

historyCardPending: {
  backgroundColor: '#FFF',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#FFD1A6',
},

historyCardPaid: {
  backgroundColor: '#FFF',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#9BE3B3',
},

historyRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 6,
},

historyCardTitle: {
  fontSize: 15,
  fontWeight: '600',
},

amountText: {
  fontWeight: '700',
},

subText: {
  color: '#555',
  marginBottom: 4,
},

dateText: {
  color: '#888',
  marginBottom: 10,
},

pendingBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#FFE8D6',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

pendingText: {
  color: '#FF6A00',
  fontWeight: '600',
},

paidBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#E6F8ED',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  marginBottom: 10,
},

paidText: {
  color: '#1EAD5A',
  fontWeight: '600',
},

creditBox: {
  backgroundColor: '#F1FFF6',
  padding: 10,
  borderRadius: 10,
},

creditText: {
  color: '#1EAD5A',
  fontWeight: '500',
},

});
