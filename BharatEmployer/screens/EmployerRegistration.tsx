import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    DeviceEventEmitter,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../lib/api'
import PrimaryButton from '../components/PrimaryButton'
import { useTranslation } from 'react-i18next'

export default function EmployerRegistration() {
    const navigation = useNavigation<any>()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Form Fields
    const [companyName, setCompanyName] = useState('')
    const [billingAddress, setBillingAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [gstNumber, setGstNumber] = useState('')
    const [employerType, setEmployerType] = useState<'individual' | 'company' | 'contractor'>('individual')

    // Bank Details (if not individual)
    const [bankName, setBankName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [ifscCode, setIfscCode] = useState('')

    useEffect(() => {
        const getSessionData = async () => {
            const id = await AsyncStorage.getItem('userId');
            if (id) setUserId(id);
        };
        getSessionData();
    }, [])

    const handleContinue = async () => {
        if (!companyName.trim()) {
            Alert.alert(t('auth.validationError'), t('reg.valEnterCompanyName'))
            return
        }

        if (!billingAddress.trim()) {
            Alert.alert(t('auth.validationError'), t('reg.valEnterAddress'))
            return
        }

        if (!phone.trim()) {
            Alert.alert(t('auth.validationError'), t('reg.valEnterPhone'))
            return
        }

        if (employerType !== 'individual') {
            if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
                Alert.alert(t('auth.validationError'), t('reg.valFillBank'))
                return
            }
        }

        if (!userId) {
            Alert.alert(t('auth.validationError'), t('reg.errUserNotFound'))
            return
        }

        setLoading(true)

        try {
            /* 1️⃣ Insert employer */
            await api.post('/users/employer', {
                employerType,
                companyName: companyName.trim(),
                billingAddress: billingAddress.trim(),
            })

            await AsyncStorage.setItem('employerProfileComplete', 'true')

            Alert.alert(t('reg.successTitle'), t('reg.profileCreated'), [
                {
                    text: t('common.ok'),
                    onPress: () => {
                        DeviceEventEmitter.emit('AUTH_PROFILE_COMPLETE')
                    },
                },
            ])
        } catch (err: any) {
            console.error(err)
            if (err.response?.status === 400 || err.response?.data?.error?.includes('exists')) {
                await AsyncStorage.setItem('employerProfileComplete', 'true')
                Alert.alert(t('reg.alreadyRegistered'), t('reg.profileExists'), [
                    { text: t('common.ok'), onPress: () => DeviceEventEmitter.emit('AUTH_PROFILE_COMPLETE') }
                ])
            } else {
                Alert.alert(t('auth.validationError'), err.response?.data?.error || err.message || t('reg.errRegisterFailed'))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFDF8" />

            <View style={styles.header}>
                <Text style={styles.title}>{t('reg.completeProfile')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.label}>{t('reg.employerType')}</Text>
                <View style={styles.typeContainer}>
                    {(['individual', 'company', 'contractor'] as const).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.typeBtn,
                                employerType === type && styles.activeTypeBtn
                            ]}
                            onPress={() => setEmployerType(type)}
                        >
                            <Text style={[
                                styles.typeText,
                                employerType === type && styles.activeTypeText
                            ]}>
                                {t(`reg.${type}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>{t('reg.companyNameLabel')}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('reg.placeholderName')}
                    value={companyName}
                    onChangeText={setCompanyName}
                />

                <Text style={styles.label}>{t('reg.billingAddress')}</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder={t('reg.placeholderAddress')}
                    multiline
                    value={billingAddress}
                    onChangeText={setBillingAddress}
                />

                <Text style={styles.label}>{t('reg.phone')}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={t('reg.placeholderPhone')}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />

                {employerType !== 'individual' && (
                    <>
                        <Text style={styles.sectionHeader}>{t('reg.bankDetails')}</Text>

                        <Text style={styles.label}>{t('reg.bankName')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('reg.placeholderBank')}
                            value={bankName}
                            onChangeText={setBankName}
                        />

                        <Text style={styles.label}>{t('reg.accountNumber')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('reg.placeholderAccount')}
                            keyboardType="numeric"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                        />

                        <Text style={styles.label}>{t('reg.ifscCode')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('reg.placeholderIfsc')}
                            autoCapitalize="characters"
                            value={ifscCode}
                            onChangeText={setIfscCode}
                        />
                    </>
                )}

                <PrimaryButton
                    title={loading ? t('reg.saving') : t('reg.saveContinue')}
                    onPress={handleContinue}
                    style={{ marginTop: 30, marginBottom: 40 }}
                    disabled={loading}
                />

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF8',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        marginTop: 16,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#FFF',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    activeTypeBtn: {
        borderColor: '#FF9F1C',
        backgroundColor: '#FFF8EB',
    },
    typeText: {
        fontSize: 12,
        color: '#555',
    },
    activeTypeText: {
        color: '#FF9F1C',
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 24,
        marginBottom: 8,
    }
})
