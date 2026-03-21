import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface PrimaryButtonProps {
    title: string
    onPress?: () => void
    style?: any
    textStyle?: any
}

export default function PrimaryButton({ title, onPress, style, textStyle }: PrimaryButtonProps) {
    return (
        <TouchableOpacity style={[styles.btn, style]} onPress={onPress}>
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: '#FF9F1C',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
})
