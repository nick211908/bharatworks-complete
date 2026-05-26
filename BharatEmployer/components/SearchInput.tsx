import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

interface SearchInputProps {
    placeholder?: string
    style?: any
    value?: string
    onChangeText?: (text: string) => void
}

export default function SearchInput({
    placeholder,
    style,
    value,
    onChangeText
}: SearchInputProps) {
    const { t } = useTranslation()
    const finalPlaceholder = placeholder || t('home.searchPlaceholder')
    return (
        <View style={[styles.searchBox, style]}>
            <Icon name="search-outline" size={20} color="#999" />
            <TextInput
                placeholder={finalPlaceholder}
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
