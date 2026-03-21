import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../assets/images/theme/colors';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { JobService } from '../../services/JobService';
/* =======================
   DESIGN TOKENS
   ======================= */


/* =======================
   TYPES & MOCK DATA
   ======================= */

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
        {icon === "🏠" ? <Feather name="home" size={20} color={active ? COLORS.primary : COLORS.textMuted} /> :
            icon === "🧰" ? <Feather name="briefcase" size={20} color={active ? COLORS.primary : COLORS.textMuted} /> :
                icon === "🙂" ? <FontAwesome5 name="user-tie" size={20} color={active ? COLORS.primary : COLORS.textMuted} /> :
                    icon === "₹" ? <Feather name="dollar-sign" size={20} color={active ? COLORS.primary : COLORS.textMuted} /> :
                        icon === "👤" ? <Feather name="user" size={20} color={active ? COLORS.primary : COLORS.textMuted} /> :
                            <Text style={{ color: active ? COLORS.primary : COLORS.textMuted }}>{icon}</Text>}
        <Text
            style={[
                styles.tabLabel,
                active && { color: COLORS.primary },
            ]}
        >
            {label}
        </Text>
    </View>
);

const LabourJobApply: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    // Get real job data passed via navigation
    const job = route.params?.job || {};

    const handleLabourHome = () => { navigation.replace('LabourHome'); };
    const handleLabourJobs = () => { navigation.replace('LabourAllJobs'); };
    const handleLabourEarnings = () => { navigation.replace('LabourEarnings'); };
    const handleLabourProfile = () => { navigation.replace('LabourProfile'); };

    const handleApply = async () => {
        if (!job?.id) {
            Alert.alert('Error', 'Job ID missing, cannot apply.');
            return;
        }
        if (applied) {
            Alert.alert('Already Applied', 'You have already applied for this job.');
            return;
        }
        try {
            setApplying(true);
            await JobService.applyForJob(job.id, '');
            setApplied(true);
            Alert.alert('Success! 🎉', 'You have successfully applied for this job. The employer will contact you shortly.');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message || 'Failed to apply';
            Alert.alert('Error', msg);
        } finally {
            setApplying(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Job Details</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Card 1: Job Info */}
                    <View style={styles.card}>
                        <View style={styles.jobHeadingRow}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.jobTitle}>{job.title || 'Job Details'}</Text>
                                <Text style={styles.companyName}>{job.company_name || job.employers?.company_name || 'Employer'}</Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={{ flexDirection: 'row', marginRight: 6 }}>
                                {[1, 2, 3, 4].map(i => <FontAwesome5 name="star" solid size={14} color="#FBBF24" key={i} />)}
                                <FontAwesome5 name="star" size={14} color="#FBBF24" />
                            </View>
                            <Text style={styles.ratingText}>
                                4.5 • Employer
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color={COLORS.textPrimary} style={styles.icon} />
                            <Text style={styles.infoText}>
                                Location{job.lat ? ` (${Number(job.lat).toFixed(3)}, ${Number(job.lng).toFixed(3)})` : ' — Not specified'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Feather name="calendar" size={18} color={COLORS.textPrimary} style={styles.icon} />
                            <Text style={styles.infoText}>
                                {job.start_time ? new Date(job.start_time).toLocaleDateString() : 'Date TBD'} • Duration varies
                            </Text>
                        </View>

                        <View style={styles.timeRow}>
                            <View style={styles.timeWrapper}>
                                <Feather name="clock" size={18} color={COLORS.textPrimary} style={styles.icon} />
                                <Text style={styles.infoText}>{job.start_time ? new Date(job.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 AM'} — work hours</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.applyButtonSmall, (applying || applied) && { opacity: 0.6 }]}
                                onPress={handleApply}
                                disabled={applying || applied}
                            >
                                {applying
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.applyButtonText}>{applied ? '✓ Applied' : 'Apply for Job'}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Card 2: Description & Skills */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Job Description</Text>
                        <Text style={styles.descriptionText}>
                            {job.title ? `Looking for experienced workers for "${job.title}" position. ${job.count ? `${job.count} slot(s) available.` : ''}` : 'No description available.'}
                        </Text>

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Job Status</Text>
                        <View style={styles.skillsContainer}>
                            <View style={styles.skillChip}>
                                <Text style={styles.skillText}>{job.status || 'OPEN'}</Text>
                            </View>
                            {job.urgent && <View style={[styles.skillChip, { backgroundColor: '#FEE2E2' }]}>
                                <Text style={[styles.skillText, { color: '#B91C1C' }]}>URGENT</Text>
                            </View>}
                        </View>
                    </View>

                    {/* Card 3: Wage */}
                    <View style={styles.card}>
                        <View style={styles.wageRow}>
                            <View>
                                <Text style={styles.sectionTitle}>Daily Wage</Text>
                                <Text style={styles.paymentTerms}>Paid daily after work</Text>
                            </View>
                            <Text style={styles.wageAmount}>₹{job.wage_per_day || '--'}/day</Text>
                        </View>
                    </View>

                    {/* Card 4: Safety */}
                    <View style={styles.card}>
                        <View style={styles.safetyHeader}>
                            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Safety Measures</Text>
                        </View>
                        <Text style={styles.safetyText}>
                            This employer provides safety equipment and follows standard safety protocols.
                        </Text>
                        <View style={styles.verifiedByRow}>
                            <Feather name="check" size={14} color="#3B82F6" style={styles.checkIcon} />
                            <Text style={styles.verifiedByText}>Verified by BharatWork</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Navigation Mockup (Visual Only based on image) */}
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
            </View>
        </SafeAreaView>
    );
};

const NavIcon = ({ icon, label, active }: { icon: string; label: string; active?: boolean }) => (
    <View style={styles.navItem}>
        <View style={[styles.navIconContainer, active && styles.navIconActive]}>
            <Text style={[styles.navIcon, active && { color: COLORS.primary }]}>{icon}</Text>
        </View>
        <Text style={[styles.navLabel, active && { color: COLORS.primary }]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    // Job Info Card Styles
    jobHeadingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    verifiedBadge: {
        backgroundColor: COLORS.successBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    verifiedText: {
        color: COLORS.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stars: {
        fontSize: 14,
        marginRight: 6,
        color: '#FBBF24', // Star yellow
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
        width: 20,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    mutedText: {
        color: COLORS.muted,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    timeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    applyButtonSmall: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    applyButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Description Card Styles
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    skillChip: {
        backgroundColor: COLORS.chipBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: {
        fontSize: 12,
        color: COLORS.textPrimary,
    },

    // Wage Card Styles
    wageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentTerms: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    wageAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.success,
    },

    // Safety Card Styles
    safetyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    safetyIcon: {
        fontSize: 18,
        marginRight: 8,
        color: '#3B82F6', // Blue shield
    },
    safetyText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 12,
        lineHeight: 20,
    },
    verifiedByRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIcon: {
        fontSize: 14,
        color: '#3B82F6',
        marginRight: 6,
    },
    verifiedByText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },

    // Nav
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        justifyContent: 'space-around',
    },
    navItem: {
        alignItems: 'center',
    },
    navIconContainer: {
        marginBottom: 4,
    },
    navIconActive: {
        // active state styling
    },
    navIcon: {
        fontSize: 20,
        color: COLORS.muted,
    },
    navLabel: {
        fontSize: 10,
        color: COLORS.muted,
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
});

export default LabourJobApply;
