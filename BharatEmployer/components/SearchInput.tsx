import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

interface SearchInputProps {
    placeholder?: string
    style?: any
    value?: string
    onChangeText?: (text: string) => void
}

export default function SearchInput({
    placeholder = 'What services do you need ?',
    style,
    value,
    onChangeText
}: SearchInputProps) {
    return (
        <View style={[styles.searchBox, style]}>
            <Icon name="search-outline" size={20} color="#999" />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 30,
        paddingHorizontal: 14,
        height: 50,
        elevation: 2,
    },
    input: {
        flex: 1,
        height: '100%',
        marginLeft: 10,
        fontSize: 14,
        color: '#000',
    },
})
