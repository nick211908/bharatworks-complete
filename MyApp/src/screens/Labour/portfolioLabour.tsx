import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import api from '../../services/api';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import COLORS from '../../assets/images/theme/colors';
const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const JobCard = ({
  title,
  company,
  pay,
  distance,
}: {
  title: string;
  company: string;
  pay: string;
  distance: string;
}) => (
  <View style={styles.jobCard}>
    <View style={styles.jobCardLeft}>
      <Text style={styles.jobTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.jobCompany} numberOfLines={1}>{company}</Text>
    </View>

    <View style={styles.jobCardRight}>
      <Text style={styles.jobPay} numberOfLines={1}>{pay}</Text>
      <Text style={styles.jobDistance} numberOfLines={1}>{distance}</Text>
    </View>
  </View>
);

const Tab = ({
  label,
  icon,
  active,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) => {
  const color = active ? COLORS.primary : COLORS.textMuted;

  // Map icon identifiers to proper vector icons
  const renderIcon = () => {
    switch (icon) {
      case 'home':
        return <Feather name="home" size={22} color={color} />;
      case 'jobs':
        return <Feather name="briefcase" size={22} color={color} />;
      case 'agent':
        return (
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color={color}
          />
        );
      case 'earnings':
        return <Feather name="dollar-sign" size={22} color={color} />;
      case 'profile':
        return <Feather name="user" size={22} color={color} />;
      default:
        return <Feather name="circle" size={22} color={color} />;
    }
  };

  return (
    <View style={styles.tab}>
      {renderIcon()}
      <Text style={[styles.tabLabel, active && { color: COLORS.primary }]}>
        {label}
      </Text>
    </View>
  );
};

const LabourHome: React.FC = () => {
  // ── All hooks first (Rules of Hooks) ──────────────────────────────
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { profile, loading } = useUserProfile();
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [isOnline, setIsOnline] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // ── Effects ───────────────────────────────────────────────────────
  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs?status=OPEN&limit=5');
        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error('Home fetchJobs error:', error);
      }
    };
    fetchJobs();
  }, []);

  // Prevent back button from going to auth screens - exit app instead
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        BackHandler.exitApp();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleLabourHome = () => navigation.replace('LabourHome');
  const handleLabourJobs = () => navigation.replace('LabourAllJobs');
  const handleLabourEarnings = () => navigation.replace('LabourEarnings');
  const handleLabourProfile = () => navigation.replace('LabourProfile');
  const handleLabourNotifications = () => navigation.replace('LabourJobNotification');

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView
        contentContainerStyle={styles.container}
        style={{ opacity: fadeAnim }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hello, {profile?.name || 'User'}</Text>
            <Text style={styles.welcome}>Welcome back!</Text>
          </View>

          <View style={styles.headerRight}>
            <Switch
              value={isOnline}
              onValueChange={val => setIsOnline(val)}
              thumbColor={isOnline ? COLORS.primary : '#f4f3f4'}
              trackColor={{ false: '#d0d0d0', true: COLORS.primary + '66' }}
            />
            <TouchableOpacity onPress={handleLabourNotifications}>
              <Feather name="bell" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Online/Offline Alert */}
        {!isOnline ? (
          <View style={styles.alert}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={COLORS.textPrimary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.alertText}>
              Offline mode active. Job alerts will not arrive via SMS.
            </Text>
          </View>
        ) : (
          <View style={[styles.alert, styles.alertOnline]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#2e7d32"
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.alertText, { color: '#2e7d32' }]}>
              You are online. Job alerts are active.
            </Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
              style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile?.name || 'User'}</Text>
                <View style={styles.verified}>
                  <Text style={styles.verifiedText}>
                    {profile?.verification_status || 'Pending'}
                  </Text>
                </View>
              </View>

              <Text style={styles.rating}>
                Reliability: {profile?.reliability_score || 0}
              </Text>
              <Text style={styles.skill}>Labour</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat
              label="Expected Wage"
              value={`₹${profile?.expected_wage || 0}`}
            />
            <Stat label="Experience" value="N/A" />
            <Stat label="Jobs Completed" value="0" />
          </View>
        </View>

        {/* Jobs Available */}
        <Text style={styles.sectionTitle}>Jobs Available</Text>

        {/* AI Match */}
        <View style={styles.aiCard}>
          <MaterialIcons
            name="record-voice-over"
            size={24}
            color={COLORS.primary}
            style={styles.aiIcon}
          />
          <View>
            <Text style={styles.aiTitle}>New AI Job Match!</Text>
            <Text style={styles.aiSub}>{jobs.length} new jobs found</Text>
          </View>
        </View>

        {/* Job Cards */}
        {jobs.map(job => (
          <JobCard
            key={job.id}
            title={job.title}
            company={job.employers?.company_name || 'Unknown Company'}
            pay={`₹${job.wage_per_day}/day`}
            distance="Unknown distance"
          />
        ))}

        {jobs.length === 0 && (
          <Text style={styles.noJobsText}>No jobs available currently.</Text>
        )}

        {/* View All */}
        <TouchableOpacity style={styles.viewAll} onPress={handleLabourJobs}>
          <Text style={styles.viewAllText}>View All Jobs</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={handleLabourHome}>
          <Tab label="Home" icon="home" active />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLabourJobs}>
          <Tab label="Jobs" icon="jobs" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLabourEarnings}>
          <Tab label="Earnings" icon="earnings" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLabourProfile}>
          <Tab label="Profile" icon="profile" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LabourHome;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hello: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  welcome: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  alert: {
    backgroundColor: COLORS.warningBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  alertOnline: {
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
  alertText: {
    fontSize: 14,
    color: COLORS.warningText,
    flex: 1,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  profileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  verified: {
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  verifiedText: {
    fontSize: 12,
    color: COLORS.successText,
    fontWeight: '600',
  },
  rating: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  skill: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  sectionTitle: {
    fontWeight: '700',
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },

  aiCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  aiIcon: {
    marginTop: 2,
  },
  aiTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  aiSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  jobCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  jobCardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  jobTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  jobCompany: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  jobPay: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.successText,
    textAlign: 'right',
  },
  jobCardRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    maxWidth: 110,
  },
  jobDistance: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },

  viewAll: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: COLORS.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  noJobsText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 16,
    marginVertical: 24,
    fontStyle: 'italic',
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
