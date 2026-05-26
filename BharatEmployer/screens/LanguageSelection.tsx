import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import PrimaryButton from '../components/PrimaryButton'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LanguageSelectionScreen() {
    const navigation = useNavigation<any>()
    const { t, i18n } = useTranslation()
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language === 'hi' ? 'Hindi' : 'English')
    const [dropdownVisible, setDropdownVisible] = useState(false)

    useEffect(() => {
        setSelectedLanguage(i18n.language === 'hi' ? 'Hindi' : 'English')
    }, [i18n.language])

    const handleLanguageChange = async (lang: string) => {
        const langCode = lang === 'Hindi' ? 'hi' : 'en'
        await i18n.changeLanguage(langCode)
        setSelectedLanguage(lang)
        setDropdownVisible(false)
    }

    const handleContinue = () => {
        navigation.navigate('Auth')
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFDF8" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logoText}>
                    BHARAT<Text style={styles.logoBlue}>WORK</Text>
                </Text>
                <TouchableOpacity style={styles.helpBtn}>
                    <Icon name="help-circle-outline" size={16} color="#FFF" />
                    <Text style={styles.helpText}>{t('common.help')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {t('common.selectLanguage').split(' Language')[0]} <Text style={styles.highlight}>{t('common.language')}</Text>
                </Text>

                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                    <Text style={styles.dropdownText}>{selectedLanguage}</Text>
                    <Icon name={dropdownVisible ? "caret-up" : "caret-down"} size={16} color="#FF9F1C" />
                </TouchableOpacity>

                {/* Dropdown items */}
                {dropdownVisible && (
                    <View style={styles.dropdownList}>
                        {['English', 'Hindi'].map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={styles.dropdownItem}
                                onPress={() => handleLanguageChange(lang)}
                            >
                                <Text style={styles.itemText}>{lang}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <PrimaryButton
                    title={t('common.continue')}
                    onPress={handleContinue}
                    style={styles.btn}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF9F1C',
    },
    logoBlue: {
        color: '#3F5BD9',
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF9F1C',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        gap: 4,
    },
    helpText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
        marginTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 40,
    },
    highlight: {
        color: '#FF9F1C',
        fontWeight: '700',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF',
        marginBottom: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownList: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    itemText: {
        fontSize: 14,
        color: '#333',
    },
    btn: {
        marginTop: 40,
    }
})
