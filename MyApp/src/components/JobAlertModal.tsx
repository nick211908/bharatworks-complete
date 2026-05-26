import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ActivityIndicator,
    Vibration,
} from 'react-native';
import { JobAlertData } from '../services/FCMService';
import { JobService } from '../services/JobService';
import { useTranslation } from 'react-i18next';

interface Props {
    job: JobAlertData | null;
    onDismiss: () => void;
}

const TIMEOUT_SECONDS = 30;
const { width } = Dimensions.get('window');

export default function JobAlertModal({ job, onDismiss }: Props) {
    const { t } = useTranslation();
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!job) return;

        // Slide up animation
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();

        // Vibrate like Uber
        Vibration.vibrate([0, 400, 200, 400]);

        // Countdown timer
        setCountdown(TIMEOUT_SECONDS);
        setAccepted(false);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleDismiss();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [job]);

    const handleDismiss = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 250,
            useNativeDriver: true,
        }).start(() => onDismiss());
    };

    const handleAccept = async () => {
        if (!job || accepting) return;
        setAccepting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        try {
            await JobService.applyForJob(job.jobId, '');
            setAccepted(true);
            setTimeout(handleDismiss, 1500);
        } catch (err: any) {
            setAccepting(false);
            const msg = err.response?.data?.error || err.message || 'Failed to accept job';
            // show inline error
            console.error('[JOB ALERT] Accept error:', msg);
            handleDismiss();
        }
    };

    if (!job) return null;

    const wage = parseFloat(job.wagePerDay);
    const dist = parseFloat(job.distanceKm);
    const isUrgent = job.urgent === 'true';

    // Countdown progress bar
    const progress = (countdown / TIMEOUT_SECONDS) * 100;

    return (
        <Modal transparent animationType="none" visible={!!job} onRequestClose={handleDismiss}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
                >
                    {/* Urgency Banner */}
                    {isUrgent && (
                        <View style={styles.urgentBanner}>
                            <Text style={styles.urgentText}>🚨  {t('labour.urgentJob')}</Text>
                        </View>
                    )}

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconEmoji}>💼</Text>
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.newJobLabel}>{t('labour.newJobNearYou')}</Text>
                            <Text style={styles.companyName}>{job.companyName}</Text>
                        </View>
                        <View style={styles.distanceBadge}>
                            <Text style={styles.distanceText}>{dist.toFixed(1)} km</Text>
                        </View>
                    </View>

                    {/* Job Title */}
                    <Text style={styles.jobTitle}>{job.title}</Text>

                    {/* Wage */}
                    <View style={styles.wageRow}>
                        <Text style={styles.wageLabel}>{t('labour.dailyWage')}</Text>
                        <Text style={styles.wageAmount}>₹{wage.toLocaleString('en-IN')}</Text>
                        <Text style={styles.wageUnit}>{t('labour.perDay')}</Text>
                    </View>

                    {/* Countdown bar */}
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
                    </View>
                    <Text style={styles.countdownText}>{t('labour.autoDecliningIn', { count: countdown })}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.declineBtn}
                            onPress={handleDismiss}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.declineBtnText}>✕  {t('labour.decline')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.acceptBtn, accepted && styles.acceptedBtn]}
                            onPress={handleAccept}
                            activeOpacity={0.8}
                            disabled={accepting || accepted}
                        >
                            {accepting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : accepted ? (
                                <Text style={styles.acceptBtnText}>✓  {t('labour.jobConfirmed')}</Text>
                            ) : (
                                <Text style={styles.acceptBtnText}>✓  {t('labour.acceptJob')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 20,
    },
    urgentBanner: {
        backgroundColor: '#FFF0F0',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFD0D0',
    },
    urgentText: {
        color: '#D00',
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF8EE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFE5B0',
    },
    iconEmoji: { fontSize: 22 },
    headerText: { flex: 1, marginLeft: 12 },
    newJobLabel: { fontSize: 11, color: '#999', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    companyName: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 2 },
    distanceBadge: {
        backgroundColor: '#EEF3FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    distanceText: { color: '#3F5BD9', fontWeight: '700', fontSize: 13 },
    jobTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A2E',
        marginBottom: 16,
    },
    wageRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
        backgroundColor: '#F8FFF4',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D4F0DA',
    },
    wageLabel: { fontSize: 13, color: '#666', flex: 1 },
    wageAmount: { fontSize: 28, fontWeight: '800', color: '#22C55E' },
    wageUnit: { fontSize: 14, color: '#666', marginLeft: 4, marginBottom: 2 },
    progressBg: {
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: 4,
        backgroundColor: '#FF9F1C',
        borderRadius: 2,
    },
    countdownText: {
        fontSize: 11,
        color: '#AAA',
        textAlign: 'right',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    declineBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DDD',
        alignItems: 'center',
    },
    declineBtnText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 15,
    },
    acceptBtn: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#FF9F1C',
        alignItems: 'center',
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    acceptedBtn: {
        backgroundColor: '#22C55E',
    },
    acceptBtnText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
    },
});
