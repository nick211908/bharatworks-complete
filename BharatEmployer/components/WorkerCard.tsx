import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

interface WorkerCardProps {
    name?: string
    role?: string
    price?: string
    imageUri?: string
}

export default function WorkerCard({
    name = 'Mamta',
    role = 'Mistri',
    price = '₹ 800/- Day',
    imageUri = 'https://i.pravatar.cc/150?img=12'
}: WorkerCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.cardCurve} />

            <Image
                source={{ uri: imageUri }}
                style={styles.cardAvatar}
            />

            <Text style={styles.cardName}>{name}</Text>
            <Text style={styles.cardRole}>{role}</Text>
            <Text style={styles.cardPrice}>{price}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: '47%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 20,
        paddingTop: 36,
        paddingBottom: 16,
        alignItems: 'center',
        elevation: 3,
        overflow: 'hidden',
    },
    cardCurve: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: 46,
        backgroundColor: '#1E2C63',
        borderBottomLeftRadius: 60,
    },
    cardAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: '#FFF',
        marginBottom: 8,
    },
    cardName: {
        fontSize: 14,
        fontWeight: '700',
    },
    cardRole: {
        fontSize: 12,
        color: '#777',
    },
    cardPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E2C63',
        marginTop: 4,
    },
})
