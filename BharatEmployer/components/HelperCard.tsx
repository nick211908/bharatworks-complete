import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

interface HelperCardProps {
    name: string
    role: string
    image: string
    wage: string
}

export default function HelperCard({ name, role, image, wage }: HelperCardProps) {
    return (
        <View style={styles.cardWrapper}>
            <View style={styles.cardCurve} />

            <View style={styles.card}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: image }} style={styles.image} />

                    <View style={styles.heart}>
                        <Icon name="heart-outline" size={16} color="#FF6B6B" />
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.name}>{name}</Text>
                            <Text style={styles.role}>{role}</Text>
                        </View>

                        <View style={styles.rating}>
                            <Icon name="star" size={12} color="#FFB703" />
                            <Text style={styles.ratingText}>4.9</Text>
                        </View>
                    </View>

                    <Text style={styles.meta}>Timing: 8:00 Am to 5:00 PM</Text>
                    <Text style={styles.meta}>Wage: {wage}</Text>

                    <TouchableOpacity style={styles.viewBtn}>
                        <Text style={styles.viewText}>View →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardWrapper: {
        marginHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    cardCurve: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: 50,
        backgroundColor: '#1E2C63',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginTop: 10,
        elevation: 3,
        overflow: 'hidden',
        padding: 16,
        flexDirection: 'row',
    },
    imageWrapper: {
        marginRight: 16,
        alignItems: 'center',
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    heart: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 4,
        elevation: 2,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    role: {
        fontSize: 12,
        color: '#777',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
    },
    meta: {
        fontSize: 12,
        color: '#555',
        marginTop: 4,
    },
    viewBtn: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    viewText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E2C63',
    },
})
