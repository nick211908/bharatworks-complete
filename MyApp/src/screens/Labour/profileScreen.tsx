import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

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

export default function LabourProfile() {
  const navigation = useNavigation<any>();
  const { profile } = useUserProfile();

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

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <Text style={styles.header}>My Profile</Text>

      {/* AVATAR */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Feather name="user" size={40} color="#999" />

          <TouchableOpacity style={styles.cameraBtn}>
            <Feather name="camera" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{profile?.name || 'User'}</Text>
      </View>

      {/* INFO CARDS */}
      <InfoCard
        icon={<Feather name="phone" size={18} color="#000" />}
        title="Phone"
        value={profile?.phone || 'N/A'}
      />
      <InfoCard
        icon={<Feather name="tool" size={18} color="#000" />}
        title="Skill"
        value="Labour"
      />
      <InfoCard
        icon={<Feather name="clock" size={18} color="#000" />}
        title="Experience"
        value="N/A"
      />

      {/* DOCUMENTS */}
      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Documents</Text>

        <DocumentRow title="Aadhaar" status="Uploaded" success />

        <DocumentRow title="PAN" status="Not Added" success={false} />
      </View>

      {/* Bottom Tab Bar */}
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

/* ================= COMPONENTS ================= */

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>{icon}</View>
      <View>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function DocumentRow({
  title,
  status,
  success,
}: {
  title: string;
  status: string;
  success: boolean;
}) {
  return (
    <View style={styles.docRow}>
      <Ionicons
        name="document-text-outline"
        size={24}
        color="#555"
        style={styles.docIcon}
      />
      <Text style={styles.docTitle}>{title}</Text>

      <View
        style={[
          styles.docStatus,
          success ? styles.docSuccess : styles.docError,
        ]}
      >
        <Text
          style={[
            styles.docStatusText,
            success ? styles.successText : styles.errorText,
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.disabledBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  name: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  infoIcon: {
    marginRight: 12,
  },

  infoTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  documentsSection: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  docRow: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  docIcon: {
    marginRight: 12,
  },

  docTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  docStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  docSuccess: {
    backgroundColor: COLORS.successBg,
  },

  docError: {
    backgroundColor: COLORS.errorBg,
  },

  docStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  successText: {
    color: COLORS.successText,
  },

  errorText: {
    color: COLORS.errorText,
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
