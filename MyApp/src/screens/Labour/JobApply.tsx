import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../assets/images/theme/colors';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { JobService } from '../../services/JobService';
import LabourBottomNav from '../../components/LabourBottomNav';
/* =======================
   DESIGN TOKENS
   ======================= */


/* =======================
   TYPES & MOCK DATA
   ======================= */



const LabourJobApply: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [jobData, setJobData] = useState<any>(route.params?.job || {});
    const [fetching, setFetching] = useState(false);

    React.useEffect(() => {
        const loadFullJob = async () => {
            if (jobData?.id) {
                try {
                    setFetching(true);
                    const data = await JobService.getJobById(jobData.id);
                    if (data) {
                        setJobData(data);
                    }
                } catch (e) {
                    console.error('loadFullJob error:', e);
                } finally {
                    setFetching(false);
                }
            }
        };
        loadFullJob();
    }, [route.params?.job?.id]);



    const handleApply = async () => {
        if (!jobData?.id) {
            Alert.alert('Error', 'Job ID missing, cannot apply.');
            return;
        }
        if (applied) {
            Alert.alert('Already Applied', 'You have already applied for this job.');
            return;
        }
        try {
            setApplying(true);
            await JobService.applyForJob(jobData.id, '');
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Job Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Banner Background */}
                <View style={styles.bannerBackground} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Card 1: Job Info */}
                    <View style={styles.card}>
                        <View style={styles.jobHeadingRow}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.jobTitle}>{jobData.title || 'Job Details'}</Text>
                                <Text style={styles.companyName}>
                                    {jobData.company_name || jobData.employers?.company_name || 'Employer'}
                                </Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={{ flexDirection: 'row', marginRight: 6 }}>
                                {[1, 2, 3, 4, 5].map(i => <FontAwesome5 name="star" solid size={12} color="#FFD700" key={i} />)}
                            </View>
                            <Text style={styles.ratingText}>
                                {jobData.rating || '4.5'} • Employer Rating
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color={COLORS.primary} style={styles.icon} />
                            <Text style={styles.infoText}>
                                {jobData.lat ? `Location (${Number(jobData.lat).toFixed(3)}, ${Number(jobData.lng).toFixed(3)})` : 'Location — Not specified'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Feather name="calendar" size={18} color={COLORS.primary} style={styles.icon} />
                            <Text style={styles.infoText}>
                                {jobData.start_time ? new Date(jobData.start_time).toLocaleDateString() : 'Date TBD'} • Duration varies
                            </Text>
                        </View>

                        <View style={styles.timeRow}>
                            <View style={styles.timeWrapper}>
                                <Feather name="clock" size={18} color={COLORS.primary} style={styles.icon} />
                                <Text style={styles.infoText}>
                                    {jobData.start_time ? new Date(jobData.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 AM'} — work hours
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Card 2: Description & Skills */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Job Description</Text>
                        <Text style={styles.descriptionText}>
                            {jobData.title ? `Looking for experienced workers for "${jobData.title}" position. ${jobData.count || jobData.slots_total ? `${jobData.count || jobData.slots_total} slot(s) available.` : ''}` : 'No description available.'}
                        </Text>

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Job Status</Text>
                        <View style={styles.skillsContainer}>
                            <View style={styles.skillChip}>
                                <Text style={styles.skillText}>{jobData.status || 'OPEN'}</Text>
                            </View>
                            {jobData.urgent ? (
                                <View style={[styles.skillChip, { backgroundColor: '#FEE2E2' }]}>
                                    <Text style={[styles.skillText, { color: '#B91C1C' }]}>URGENT</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Card 3: Wage */}
                    <View style={styles.card}>
                        <View style={styles.wageRow}>
                            <View>
                                <Text style={styles.sectionTitle}>Daily Wage</Text>
                                <Text style={styles.paymentTerms}>Paid daily after work</Text>
                            </View>
                            <Text style={styles.wageAmount}>₹{jobData.wagePerDay || jobData.wage_per_day || '--'}/day</Text>
                        </View>
                    </View>

                    {/* Card 4: Safety */}
                    <View style={styles.card}>
                        <View style={styles.safetyHeader}>
                            <Feather name="shield" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Safety Measures</Text>
                        </View>
                        <Text style={styles.safetyText}>
                            This employer provides safety equipment and follows standard safety protocols.
                        </Text>
                        <View style={styles.verifiedByRow}>
                            <Feather name="check-circle" size={14} color="#3B82F6" style={styles.checkIcon} />
                            <Text style={styles.verifiedByText}>Verified by BharatWork</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Sticky Apply Button */}
                <View style={styles.stickyFooterButton}>
                    <TouchableOpacity
                        style={[styles.applyButtonFull, (applying || applied) && { backgroundColor: COLORS.success }]}
                        onPress={handleApply}
                        disabled={applying || applied}
                    >
                        {applying ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                {applied ? <Feather name="check" size={18} color="#fff" style={{ marginRight: 4 }} /> : null}
                                <Text style={styles.applyButtonFullText}>
                                    {applied ? 'Application Sent' : 'Apply for Job'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Bottom Navigation */}
                <LabourBottomNav activeTab="Home" />
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

    backButton: {
        padding: 8,
    },
    bannerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        backgroundColor: COLORS.primary,
        opacity: 0.1, // Soft background tint
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    stickyFooterButton: {
        position: 'absolute',
        bottom: 50, // Above bottom tabs
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000, // Guarantee Click interactive
    },
    applyButtonFull: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    applyButtonFullText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LabourJobApply;
