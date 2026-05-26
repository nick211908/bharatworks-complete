import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../assets/images/theme/colors';
import { useTranslation } from 'react-i18next';

export interface JobCardProps {
    title: string;
    company: string;
    rating?: string;
    pay: string;
    distance?: string;
    urgent?: boolean;
    skills?: string[];
    jobType?: string;
    duration?: string;
    onPress?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
    title,
    company,
    rating = '4.2',
    pay,
    distance,
    urgent,
    skills = [],
    jobType,
    duration,
    onPress,
}) => {
    const { t } = useTranslation();
    
    // Generate avatar color based on company name
    const getAvatarColor = (name: string) => {
        const colors = ['#FF8C69', '#2A9D8F', '#457B9D', '#F4A261', '#E63946', '#2ECC71'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const avatarColor = getAvatarColor(company);
    const initial = company.charAt(0).toUpperCase();

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
            {/* Urgency Banner */}
            {urgent && (
                <View style={styles.urgentBanner}>
                    <Feather name="zap" size={12} color="#FFF" />
                    <Text style={styles.urgentText}>{t('labour.hiringUrgently')}</Text>
                </View>
            )}

            {/* Header with Avatar */}
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{title}</Text>
                    <View style={styles.companyRow}>
                        <Text style={styles.companyName} numberOfLines={1}>{company}</Text>
                        <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={14} color={COLORS.success} />
                        </View>
                    </View>
                </View>
                <View style={styles.ratingBadge}>
                    <Feather name="star" size={12} color="#FFB800" />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>
            </View>

            {/* Skills Tags */}
            {skills.length > 0 && (
                <View style={styles.skillsContainer}>
                    {skills.slice(0, 3).map((skill, index) => (
                        <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                    {skills.length > 3 && (
                        <View style={styles.moreTag}>
                            <Text style={styles.moreText}>+{skills.length - 3}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Job Details */}
            <View style={styles.detailsRow}>
                {jobType && (
                    <View style={styles.detailItem}>
                        <Feather name="briefcase" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{jobType}</Text>
                    </View>
                )}
                {duration && (
                    <View style={styles.detailItem}>
                        <Feather name="clock" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{duration}</Text>
                    </View>
                )}
                {distance && (
                    <View style={styles.detailItem}>
                        <Feather name="map-pin" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{distance}</Text>
                    </View>
                )}
            </View>

            {/* Footer with Pay and CTA */}
            <View style={styles.footer}>
                <View style={styles.paySection}>
                    <Text style={styles.payLabel}>{t('labour.dailyWage')}</Text>
                    <Text style={styles.payAmount}>{pay}</Text>
                </View>
                <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
                    <Text style={styles.applyText}>{t('labour.applyNow')}</Text>
                    <Feather name="arrow-right" size={16} color="#FFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
    },
    urgentBanner: {
        position: 'absolute',
        top: 12,
        right: -28,
        backgroundColor: COLORS.error,
        paddingHorizontal: 32,
        paddingVertical: 4,
        transform: [{ rotate: '45deg' }],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        zIndex: 1,
    },
    urgentText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
    },
    headerContent: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    companyName: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    verifiedBadge: {
        marginLeft: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B8860B',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    skillTag: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    skillText: {
        fontSize: 11,
        color: COLORS.primaryDark,
        fontWeight: '600',
    },
    moreTag: {
        backgroundColor: COLORS.chipBg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    moreText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paySection: {
        flex: 1,
    },
    payLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    payAmount: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.success,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    applyText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default JobCard;
