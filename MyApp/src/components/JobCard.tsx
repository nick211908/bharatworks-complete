import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const COLORS = {
    white: '#FFFFFF',
    primary: '#F08A33',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    success: '#16A34A',
    muted: '#9CA3AF',
    border: '#E5E7EB',
};

export interface JobCardProps {
    title: string;
    company: string;
    rating: string;
    pay: string;
    distance: string;
    urgent?: boolean;
    onPress?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
    title,
    company,
    rating,
    pay,
    distance,
    urgent,
    onPress,
}) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
        {/* Header */}
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.jobTitle}>{title}</Text>
                <Text style={styles.company}>{company}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                {urgent && (
                    <View style={styles.urgent}>
                        <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                )}
                <Text style={styles.pay}>{pay}</Text>
            </View>
        </View>

        import Feather from 'react-native-vector-icons/Feather';

        {/* Rating & Distance */}
        <View style={styles.metaRow}>
            <View style={styles.iconTextRow}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={styles.rating}>{rating}</Text>
            </View>
            <View style={styles.iconTextRow}>
                <Feather name="map-pin" size={12} color={COLORS.textSecondary} />
                <Text style={styles.distance}>{distance}</Text>
            </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
            <View style={styles.iconTextRow}>
                <Feather name="check-circle" size={14} color={COLORS.success} />
                <Text style={styles.verified}> Verified Employer</Text>
            </View>
            <Text style={styles.details}>View Details</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    jobTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    company: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    pay: {
        fontWeight: '700',
        color: COLORS.success,
    },
    urgent: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 4,
    },
    urgentText: {
        fontSize: 10,
        color: '#B91C1C',
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 12,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    distance: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        alignItems: 'center',
    },
    verified: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '500',
    },
    details: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default JobCard;
