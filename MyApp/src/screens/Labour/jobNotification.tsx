import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Pressable,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native'

import { JobService } from '../../services/JobService'

import Feather, { FeatherIconName } from '@react-native-vector-icons/feather'
import Ionicons from '@react-native-vector-icons/ionicons'
import COLORS from '../../assets/images/theme/colors'
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

type ViewState = 'LOADING' | 'CONFIRM' | 'SUCCESS' | 'NONE'

const ORANGE = '#FF7A1A'
const CREAM_BG = '#FFFDF5'

interface JobData {
    job_id: string;
    title: string;
    wage_per_day: number;
    distance_km?: number;
    employer_id?: string;
    company_name?: string;
    start_time?: string;
    end_time?: string;
}

export default function LabourJobNotification() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Navigation handlers
    const handleLabourHome = () => navigation.replace('LabourHome');
    const handleLabourJobs = () => navigation.replace('LabourAllJobs');

    // State
    const [viewState, setViewState] = useState<ViewState>('LOADING')
    const [loading, setLoading] = useState(false);
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [fullJobDetails, setFullJobDetails] = useState<any>(null);

    useEffect(() => {
        initializeJobData();
    }, []);

    const initializeJobData = async () => {
        try {
            // Check if we have full jobData from route params (from notification)
            const routeData = route.params?.jobData;
            const notificationData = route.params?.notification?.data;

            // Notification may contain JSON data with job_id
            let jobId: string | null = null;
            let initialData: JobData | null = null;

            if (routeData) {
                initialData = routeData;
                jobId = routeData.job_id;
            } else if (notificationData) {
                // Parse if string
                const parsed = typeof notificationData === 'string'
                    ? JSON.parse(notificationData)
                    : notificationData;
                initialData = parsed;
                jobId = parsed.job_id;
            }

            if (!jobId) {
                Alert.alert(t('common.error'), t('labour.noJobInfo'));
                setViewState('NONE');
                return;
            }

            // Fetch full job details
            const fullJob = await JobService.getJobById(jobId);

            setJobData({
                job_id: fullJob.id,
                title: fullJob.title,
                wage_per_day: fullJob.wage_per_day,
                distance_km: initialData?.distance_km,
                employer_id: fullJob.employer_id,
                company_name: fullJob.employers?.company_name || t('labour.hiringEmployer'),
                start_time: fullJob.start_time,
                end_time: fullJob.end_time,
            });
            setFullJobDetails(fullJob);
            setViewState('CONFIRM');

        } catch (error: any) {
            console.error('Error loading job:', error);
            Alert.alert(t('common.error'), t('labour.failedToLoadJob'));
            setViewState('NONE');
        }
    };

    const handleAcceptJob = async () => {
        if (!jobData) return;
        setLoading(true);
        try {
            // TODO: Get real worker ID from Auth Context or Storage
            const workerId = "test-worker-id"; // Replace with actual auth
            await JobService.applyForJob(jobData.job_id, workerId);
            setViewState('SUCCESS');
        } catch (error: any) {
            Alert.alert(t('labour.applicationFailed'), error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setViewState('NONE');
        navigation.goBack();
    };

    // Format time for display
    const formatTime = (isoString?: string) => {
        if (!isoString) return 'TBD';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'TBD';
        const date = new Date(isoString);
        const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (viewState === 'NONE') {
        return null;
    }

    if (viewState === 'LOADING') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={styles.loadingText}>{t('labour.loadingJobDetails')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            {/* CONFIRM MODAL */}
            <Modal transparent visible={viewState === 'CONFIRM'} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{t('labour.confirmJobAcceptance')}</Text>
                            <Pressable onPress={handleClose}>
                                <Feather name="x" size={24} color="#666" />
                            </Pressable>
                        </View>

                        <InfoRow
                            icon="briefcase"
                            label={t('labour.position')}
                            value={jobData?.title || t('labour.jobDetails')}
                        />
                        <InfoRow
                            icon="credit-card"
                            label={t('labour.wage')}
                            value={`₹${jobData?.wage_per_day || 'N/A'}${t('labour.perDay')}`}
                        />
                        <InfoRow
                            icon="map-pin"
                            label={t('auth.location')}
                            value={jobData?.distance_km ? t('labour.distance', { count: jobData.distance_km.toFixed(1) }) : t('labour.calculateOnMap')}
                        />
                        <InfoRow
                            icon="users"
                            label={t('labour.hiringEmployer')}
                            value={jobData?.company_name || t('labour.hiringEmployer')}
                        />

                        <View style={styles.actions}>
                            <Pressable style={styles.cancelBtn} onPress={handleClose}>
                                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.acceptBtn, loading && { opacity: 0.7 }]}
                                onPress={handleAcceptJob}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.acceptText}>{t('labour.acceptNow')}</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* JOB CONFIRMED - Full Screen */}
            <Modal visible={viewState === 'SUCCESS'} animationType="slide">
                <SafeAreaView style={styles.successRoot}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        {/* Header Section */}
                        <View style={styles.successHeader}>
                            <View style={styles.checkCircleLarge}>
                                <Feather name="check" size={48} color="#2ECC71" />
                            </View>
                            <Text style={styles.successTitleMain}>{t('labour.jobConfirmed')}</Text>
                            <Text style={styles.successSubtitle}>{t('labour.applySuccessSubtitle')}</Text>
                        </View>

                        {/* Job Details Card */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardTitle}>{t('labour.jobDetails')}</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('labour.position')}</Text>
                                <Text style={styles.detailValue}>{jobData?.title || 'Job'}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('labour.hiringEmployer')}</Text>
                                <Text style={styles.detailValue}>{jobData?.company_name || 'Employer'}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('labour.wage')}</Text>
                                <Text style={styles.detailHighlight}>₹{jobData?.wage_per_day}{t('labour.perDay')}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('labour.startDate')}</Text>
                                <View style={styles.valueWithIcon}>
                                    <Feather name="calendar" size={14} color="#333" style={{ marginRight: 6 }} />
                                    <Text style={styles.detailValue}>{formatDate(jobData?.start_time)}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('labour.timing')}</Text>
                                <Text style={styles.detailValue}>
                                    {formatTime(jobData?.start_time)} - {formatTime(jobData?.end_time)}
                                </Text>
                            </View>
                        </View>

                        {/* Contact Card */}
                        <View style={styles.detailsCard}>
                            <Text style={styles.cardTitle}>{t('labour.contactEmployer')}</Text>
                            <Text style={styles.cardSub}>{t('labour.contactSub')}</Text>

                            <View style={styles.contactActions}>
                                <Pressable style={styles.contactBtnOutline}>
                                    <Ionicons name="chatbubble-outline" size={20} color={ORANGE} style={{ marginRight: 8 }} />
                                    <Text style={styles.contactBtnTextOutline}>{t('labour.message')}</Text>
                                </Pressable>

                                <Pressable style={styles.contactBtnFill}>
                                    <Ionicons name="call-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.contactBtnTextFill}>{t('labour.call')}</Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={{ height: 30 }} />

                        {/* Bottom Actions */}
                        <Pressable style={styles.homeBtn} onPress={handleLabourHome}>
                            <Text style={styles.homeBtnText}>{t('labour.goToHome')}</Text>
                        </Pressable>

                        <Pressable style={styles.findJobsBtn} onPress={handleLabourJobs}>
                            <Text style={styles.findJobsText}>{t('labour.findMoreJobs')}</Text>
                        </Pressable>

                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

/* ---------- Sub-component ---------- */

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: FeatherIconName
    label: string
    value: string
}) {
    return (
        <View style={styles.row}>
            <View style={styles.iconBox}>
                <Feather name={icon} size={20} color="#0A58FF" />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    )
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CREAM_BG,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },

    // Modal Overlay
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Confirm Card
    card: {
        width: '88%',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    close: {
        fontSize: 18,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    label: { fontSize: 12, color: '#888' },
    value: { fontSize: 14, fontWeight: '500' },
    actions: { flexDirection: 'row', marginTop: 20 },
    cancelBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F2F2F2',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelText: { color: '#555', fontWeight: '500' },
    acceptBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: ORANGE,
        alignItems: 'center',
    },
    acceptText: { color: '#fff', fontWeight: '600' },

    // --- Success Screen Styles ---
    successRoot: {
        flex: 1,
        backgroundColor: CREAM_BG,
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    successHeader: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    checkCircleLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E6F9EF', // Light green
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#D4F5E2',
    },
    successTitleMain: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Details Card
    detailsCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    cardSub: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
        marginTop: -10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    detailHighlight: {
        fontSize: 14,
        fontWeight: '600',
        color: '#22C55E', // Green
    },
    valueWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Contact Buttons
    contactActions: {
        flexDirection: 'row',
        gap: 12,
    },
    contactBtnOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ORANGE,
        backgroundColor: '#fff',
    },
    contactBtnFill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: ORANGE,
    },
    contactBtnTextOutline: {
        color: ORANGE,
        fontWeight: '600',
        fontSize: 14,
    },
    contactBtnTextFill: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    // Bottom Buttons
    homeBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: ORANGE,
        alignItems: 'center',
        marginBottom: 16,
    },
    homeBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    findJobsBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ORANGE,
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: 20,
    },
    findJobsText: {
        color: ORANGE,
        fontSize: 16,
        fontWeight: '600',
    },
})
