import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import COLORS from '../assets/images/theme/colors';
import { useTranslation } from 'react-i18next';

const TabButton = ({
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
    ) : icon === '₹' ? (
      <FontAwesome5
        name="rupee-sign"
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

interface LabourBottomNavProps {
    activeTab: 'Home' | 'Jobs' | 'Earnings' | 'Profile';
}

export default function LabourBottomNav({ activeTab }: LabourBottomNavProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

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
        <View style={styles.tabBar}>
            <TouchableOpacity onPress={handleLabourHome}>
                <TabButton label={t('profile.home')} icon="🏠" active={activeTab === 'Home'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLabourJobs}>
                <TabButton label={t('labour.jobs')} icon="🧰" active={activeTab === 'Jobs'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLabourEarnings}>
                <TabButton label={t('labour.earnings')} icon="₹" active={activeTab === 'Earnings'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLabourProfile}>
                <TabButton label={t('profile.title')} icon="👤" active={activeTab === 'Profile'} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
    },
    tab: {
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },
});
