import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import JobCard from '../../components/JobCard';
import LabourBottomNav from '../../components/LabourBottomNav';
import JobAlertModal from '../../components/JobAlertModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import { JobService } from '../../services/JobService';
import { registerFcmToken, onForegroundJobAlert, JobAlertData } from '../../services/FCMService';
import Geolocation from 'react-native-geolocation-service';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

/* =======================
   DESIGN TOKENS
======================= */
const COLORS = {
  background: '#FBF3DF',
  white: '#FFFFFF',
  primary: '#F08A33',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#16A34A',
  muted: '#9CA3AF',
  border: '#E5E7EB',
};

/* =======================
   MAIN SCREEN
======================= */
const LabourAllJobs: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [location, setLocation] = React.useState<{ lat: number, lng: number } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [jobAlert, setJobAlert] = React.useState<JobAlertData | null>(null);

  React.useEffect(() => {
    fetchJobs();
    // Register FCM token once on mount
    registerFcmToken().catch(e => console.warn('[FCM] Token reg failed:', e.message));
    // Subscribe to foreground job alerts
    const unsubscribe = onForegroundJobAlert((job) => setJobAlert(job));
    return unsubscribe;
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Try to get location first
      let userLat, userLng;

      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }

      // We'll wrap Geolocation in a Promise to wait for it (with timeout)
      try {
        const position = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 });
        });
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
        setLocation({ lat: userLat, lng: userLng });
      } catch (e) {
        console.log("Location fetch failed, falling back to all jobs", e);
      }

      let data;
      if (userLat && userLng) {
        // Fetch nearby jobs (e.g., within 50km)
        try {
          data = await JobService.fetchJobsNearby(userLat, userLng, 50);
        } catch (e) {
          console.warn("Nearby jobs failed; falling back to all jobs", e);
          data = await JobService.getAvailableJobs();
        }
      } else {
        // Fallback to all open jobs
        data = await JobService.getAvailableJobs();
      }

      if (data) setJobs(data);

    } catch (error) {
      console.error("Error fetching jobs:", error);
      setErrorMessage(t('labour.unableToLoadJobs'));
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search
  const searchLower = search.toLowerCase();
  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchLower) ||
    job.employer_id?.toLowerCase().includes(searchLower)
  );

  const route = useRoute<any>();
  const handleLabourHome = () => {
    navigation.replace('LabourHome');
  };
  return (
    <SafeAreaView style={styles.safe}>
      {/* Job Alert Modal — Uber style popup */}
      <JobAlertModal
        job={jobAlert}
        onDismiss={() => setJobAlert(null)}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.title}>{t('labour.availableJobs')}</Text>

        {/* Search */}
        <TextInput
          placeholder={t('labour.searchJobs')}
          placeholderTextColor={COLORS.muted}
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter / Sort */}
        <View style={styles.actionsRow}>
          <ActionButton label={t('labour.filter')} icon={<Feather name="filter" size={16} color={COLORS.textPrimary} />} />
          <ActionButton label={t('labour.sort')} icon={<FontAwesome5 name="sort" size={16} color={COLORS.textPrimary} />} />
        </View>

        {/* Job Cards */}
        {loading ? (
          <Text style={{ textAlign: 'center', color: COLORS.muted, marginTop: 20 }}>{t('labour.findingJobsNearYou')}</Text>
        ) : errorMessage ? (
          <Text style={{ textAlign: 'center', color: COLORS.muted, marginTop: 20 }}>
            {errorMessage}
          </Text>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.employers?.company_name || job.company_name || t('labour.hiringEmployer')}
              rating="4.2"
              pay={`₹${job.wage_per_day}${t('labour.perDay')}`}
              distance={job.distance_meters ? t('labour.distance', { count: (job.distance_meters / 1000).toFixed(1) }) : t('labour.unknownDistance')}
              urgent={job.status === 'OPEN'}
              onPress={() => navigation.navigate('LabourJobApply', { job })}
            />
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: COLORS.muted, marginTop: 20 }}>
            {jobs.length === 0 ? t('labour.noJobsAvailable') : t('labour.noJobsMatchSearch')}
          </Text>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <LabourBottomNav activeTab="Jobs" />
    </SafeAreaView>
  );
};

/* =======================
   COMPONENTS
======================= */

const ActionButton = ({
  label,
  icon,
}: {
  label: string;
  icon: string | any;
}) => (
  <TouchableOpacity style={styles.actionBtn}>
    {typeof icon === 'string' ? <Text>{icon}</Text> : icon}
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.textPrimary,
  },

  search: {
    height: 48,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontWeight: '500',
  },
});

export default LabourAllJobs;
