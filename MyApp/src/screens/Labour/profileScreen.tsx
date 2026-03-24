import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthService } from '../../services/AuthService';

import COLORS from '../../assets/images/theme/colors';
import LabourBottomNav from '../../components/LabourBottomNav';

export default function LabourProfile() {
  const navigation = useNavigation<any>();
  const { profile } = useUserProfile();



  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Opening' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER BANNER */}
      <View style={styles.bannerBackground} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <Text style={styles.header}>My Profile</Text>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </Text>
            <TouchableOpacity style={styles.cameraBtn}>
              <Feather name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{profile?.name || 'User'}</Text>
          <Text style={styles.viewProfileText}>Verified Member</Text>
        </View>

        {/* INFO GRIDS */}
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.sectionCard}>
          <InfoCard
            icon={<Feather name="phone" size={18} color={COLORS.primary} />}
            title="Phone Number"
            value={profile?.phone || 'N/A'}
          />
          <View style={styles.divider} />
          <InfoCard
            icon={<Feather name="tool" size={18} color={COLORS.primary} />}
            title="Primary Skill"
            value="Labour"
          />
          <View style={styles.divider} />
          <InfoCard
            icon={<Feather name="clock" size={18} color={COLORS.primary} />}
            title="Work Experience"
            value="N/A"
          />
        </View>

        {/* DOCUMENTS */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>

          <View style={styles.sectionCard}>
            <DocumentRow title="Aadhaar Card" status="Uploaded" success={true} />
            <View style={styles.divider} />
            <DocumentRow title="PAN Card" status="Not Added" success={false} />
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#FF4D4D" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <LabourBottomNav activeTab="Profile" />
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
    backgroundColor: '#FFEFEB', // Solid background prevents Android rendering glitches
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FFF', // Adds premium white trim
    overflow: 'hidden', // Forces strict circle clipping
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
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  viewProfileText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  infoIcon: {
    marginRight: 14,
    backgroundColor: '#FFF4EB',
    padding: 10,
    borderRadius: 8,
  },

  infoTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  documentsSection: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  docIcon: {
    marginRight: 12,
  },

  docTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  docStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  docSuccess: {
    backgroundColor: '#E6F4EA',
  },

  docError: {
    backgroundColor: '#FFF0F0',
  },

  docStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  successText: {
    color: '#2E7D32',
  },

  errorText: {
    color: '#D32F2F',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFEBEB',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 40,
    gap: 8,
  },

  logoutText: {
    color: '#FF4D4D',
    fontWeight: '700',
    fontSize: 15,
  },



  bannerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: COLORS.primary,
    opacity: 0.85,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
