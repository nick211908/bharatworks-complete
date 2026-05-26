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
import { useTranslation } from 'react-i18next';

const LabourJobApply: React.FC = () => {
    const { t } = useTranslation();
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
            Alert.alert(t('common.error'), 'Job ID missing, cannot apply.');
            return;
        }
        if (applied) {
            Alert.alert(t('labour.alreadyApplied'), t('labour.alreadyAppliedMsg'));
            return;
        }
        try {
            setApplying(true);
            await JobService.applyForJob(jobData.id, '');
            setApplied(true);
            Alert.alert(t('labour.applySuccessTitle'), t('labour.applySuccessMsg'));
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message || t('common.failed');
            Alert.alert(t('common.error'), msg);
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
                    <Text style={styles.headerTitle}>{t('labour.jobDetails')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Banner Background */}
                <View style={styles.bannerBackground} />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Card 1: Job Info */}
                    <View style={styles.card}>
                        <View style={styles.jobHeadingRow}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.jobTitle}>{jobData.title || t('labour.jobDetails')}</Text>
                                <Text style={styles.companyName}>
                                    {jobData.company_name || jobData.employers?.company_name || t('labour.hiringEmployer')}
                                </Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>{t('labour.verified')}</Text>
                            </View>
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={{ flexDirection: 'row', marginRight: 6 }}>
                                {[1, 2, 3, 4, 5].map(i => <FontAwesome5 name="star" solid size={12} color="#FFD700" key={i} />)}
                            </View>
                            <Text style={styles.ratingText}>
                                {jobData.rating || '4.5'} • {t('labour.employerRating')}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color={COLORS.primary} style={styles.icon} />
                            <Text style={styles.infoText}>
                                {jobData.lat ? `${t('auth.location')} (${Number(jobData.lat).toFixed(3)}, ${Number(jobData.lng).toFixed(3)})` : t('labour.locationNotSpecified')}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Feather name="calendar" size={18} color={COLORS.primary} style={styles.icon} />
                            <Text style={styles.infoText}>
                                {jobData.start_time ? new Date(jobData.start_time).toLocaleDateString() : t('labour.dateTbd')} • {t('labour.durationVaries')}
                            </Text>
                        </View>

                        <View style={styles.timeRow}>
                            <View style={styles.timeWrapper}>
                                <Feather name="clock" size={18} color={COLORS.primary} style={styles.icon} />
                                <Text style={styles.infoText}>
                                    {jobData.start_time ? new Date(jobData.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '9:00 AM'} — {t('labour.workHours')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Card 2: Description & Skills */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{t('labour.jobDescription')}</Text>
                        <Text style={styles.descriptionText}>
                            {jobData.title ? t('labour.lookingForWorkers', { title: jobData.title }) + " " + (jobData.count || jobData.slots_total ? t('labour.slotsAvailable', { count: jobData.count || jobData.slots_total }) : '') : t('labour.noDescription')}
                        </Text>

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('labour.jobStatus')}</Text>
                        <View style={styles.skillsContainer}>
                            <View style={styles.skillChip}>
                                <Text style={styles.skillText}>{jobData.status || 'OPEN'}</Text>
                            </View>
                            {jobData.urgent ? (
                                <View style={[styles.skillChip, { backgroundColor: '#FEE2E2' }]}>
                                    <Text style={[styles.skillText, { color: '#B91C1C' }]}>{t('labour.urgent')}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Card 3: Wage */}
                    <View style={styles.card}>
                        <View style={styles.wageRow}>
                            <View>
                                <Text style={styles.sectionTitle}>{t('labour.wage')}</Text>
                                <Text style={styles.paymentTerms}>{t('labour.paidDaily')}</Text>
                            </View>
                            <Text style={styles.wageAmount}>₹{jobData.wagePerDay || jobData.wage_per_day || '--'}{t('labour.perDay')}</Text>
                        </View>
                    </View>

                    {/* Card 4: Safety */}
                    <View style={styles.card}>
                        <View style={styles.safetyHeader}>
                            <Feather name="shield" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>{t('labour.safetyMeasures')}</Text>
                        </View>
                        <Text style={styles.safetyText}>
                            {t('labour.safetyStandard')}
                        </Text>
                        <View style={styles.verifiedByRow}>
                            <Feather name="check-circle" size={14} color="#3B82F6" style={styles.checkIcon} />
                            <Text style={styles.verifiedByText}>{t('labour.verifiedByBharatWork')}</Text>
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
                                    {applied ? t('labour.applicationSent') : t('labour.applyForJob')}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 250, // More bottom padding to avoid sticky footer overlap
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
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
        backgroundColor: '#DCFCE7', // COLORS.successBg equivalent
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    verifiedText: {
        color: '#16A34A', // COLORS.success equivalent
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 8,
        width: 20,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    timeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
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
        backgroundColor: '#F3F4F6', // COLORS.chipBg equivalent
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: {
        fontSize: 12,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
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
    safetyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
        marginRight: 6,
    },
    verifiedByText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
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
        opacity: 0.1,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    stickyFooterButton: {
        position: 'absolute',
        bottom: 70, // Above bottom tabs
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1000,
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
