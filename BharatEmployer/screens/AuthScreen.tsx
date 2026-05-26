import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    ScrollView,
    Alert,
    DeviceEventEmitter,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons'
import PrimaryButton from '../components/PrimaryButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../lib/api'
import { useTranslation } from 'react-i18next'

export default function AuthScreen() {
    const navigation = useNavigation<any>()
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

    // Form States
    const [identifier, setIdentifier] = useState('') // email or phone
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [dob, setDob] = useState('')
    const [phone, setPhone] = useState('')

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Handlers
    const handleLogin = async () => {
        if (!identifier.trim()) {
            Alert.alert(t('auth.validationError'), t('auth.enterEmailPhone'))
            return
        }
        if (!password) {
            Alert.alert(t('auth.validationError'), t('auth.enterPassword'))
            return
        }
        setLoading(true)
        try {
            const response = await api.post('/auth/login', {
                email: identifier.includes('@') ? identifier : undefined,
                phone: !identifier.includes('@') ? identifier : undefined,
                password: password,
            })

            if (response.data.token) {
                await AsyncStorage.setItem('userToken', response.data.token)
                await AsyncStorage.setItem('userId', response.data.user.id)
                await AsyncStorage.setItem('employerProfileComplete', 'true')
                DeviceEventEmitter.emit('AUTH_LOGIN')
            }
        } catch (err: any) {
            Alert.alert(t('auth.loginFailed'), err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignup = async () => {
        // Validation
        if (!fullName.trim()) {
            Alert.alert(t('auth.validationError'), t('auth.enterFullName'))
            return
        }

        if (!identifier.trim()) {
            Alert.alert(t('auth.validationError'), t('auth.enterEmail'))
            return
        }

        if (!phone.trim()) {
            Alert.alert(t('auth.validationError'), t('auth.enterPhoneOnly'))
            return
        }

        if (!password || password.length < 6) {
            Alert.alert(t('auth.validationError'), t('auth.passwordTooShort'))
            return
        }

        setLoading(true)

        try {
            const response = await api.post('/auth/signup', {
                email: identifier,
                phone: phone,
                password: password,
                name: fullName,
                role: 'employer'
            })

            if (response.data.token) {
                await AsyncStorage.setItem('userToken', response.data.token);
                await AsyncStorage.setItem('userId', response.data.user.id);
            }

            Alert.alert(
                t('auth.accountCreated'),
                t('auth.completeProfileDesc'),
                [
                    {
                        text: t('common.continue'),
                        onPress: () => {
                            setFullName('')
                            setIdentifier('')
                            setPassword('')
                            setDob('')
                            setPhone('')
                            setShowPassword(false)
                            navigation.navigate('EmployerRegistration')
                        }
                    }
                ]
            )
        } catch (err: any) {
            Alert.alert(t('auth.signupFailed'), err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                        onPress={() => setActiveTab('login')}
                    >
                        <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>{t('auth.login')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                        onPress={() => setActiveTab('signup')}
                    >
                        <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>{t('auth.signup')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {activeTab === 'signup' && (
                        <>
                            <Text style={styles.label}>{t('auth.fullName')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.placeholderName')}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </>
                    )}

                    <Text style={styles.label}>{activeTab === 'login' ? t('auth.emailOrPhone') : t('auth.email')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={activeTab === 'login' ? t('auth.placeholderEmailPhone') : t('auth.placeholderEmail')}
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                    />

                    {activeTab === 'signup' && (
                        <>
                            <Text style={styles.label}>{t('auth.dob')}</Text>
                            <View style={styles.inputWithIcon}>
                                <TextInput
                                    style={styles.flexInput}
                                    placeholder={t('auth.placeholderDob')}
                                    value={dob}
                                    onChangeText={setDob}
                                />
                                <Icon name="calendar-outline" size={20} color="#999" />
                            </View>

                            <Text style={styles.label}>{t('auth.phone')}</Text>
                            <View style={styles.phoneRow}>
                                <View style={styles.flagBox}>
                                    {/* Mock Flag */}
                                    <Text>🇮🇳</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginTop: 0 }]}
                                    placeholder={t('auth.placeholderPhone')}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                        </>
                    )}

                    <Text style={styles.label}>{activeTab === 'login' ? t('auth.password') : t('auth.setPassword')}</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            style={styles.flexInput}
                            placeholder={t('auth.passwordPlaceholder')}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'login' && (
                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
                        </TouchableOpacity>
                    )}

                    <PrimaryButton
                        title={t('common.continue')}
                        onPress={activeTab === 'login' ? handleLogin : handleSignup}
                        style={{ marginTop: 24 }}
                    />

                    {loading && <Text style={{ textAlign: 'center', marginTop: 10 }}>{t('common.loading')}</Text>}

                    {/* Social Login (UI Only for Login tab) */}
                    {activeTab === 'login' && (
                        <>
                            <View style={styles.dividerBox}>
                                <View style={styles.divider} />
                                <Text style={styles.orText}>{t('auth.or')}</Text>
                                <View style={styles.divider} />
                            </View>

                            <TouchableOpacity style={styles.socialBtn}>
                                <Icon name="logo-apple" size={20} color="#000" />
                                <Text style={styles.socialText}>{t('auth.loginApple')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialBtn}>
                                <Icon name="logo-google" size={20} color="#DB4437" />
                                <Text style={styles.socialText}>{t('auth.loginGoogle')}</Text>
                            </TouchableOpacity>

                            <View style={styles.footerRow}>
                                <Text style={styles.footerText}>{t('auth.dontHaveAccount')}</Text>
                                <TouchableOpacity onPress={() => setActiveTab('signup')}>
                                    <Text style={styles.signupLink}>{t('auth.signup')}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
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
    scrollContent: {
        padding: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 40,
        marginBottom: 30,
        backgroundColor: 'transparent',
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FF9F1C',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    activeTabText: {
        color: '#3F5BD9',
    },
    form: {
        marginTop: 10,
    },
    label: {
        fontSize: 12,
        color: '#777',
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        backgroundColor: '#FFF',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
    },
    flexInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
    },
    phoneRow: {
        flexDirection: 'row',
        gap: 10,
    },
    flagBox: {
        width: 60,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgotText: {
        color: '#FF9F1C',
        fontSize: 12,
    },
    dividerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#DADADA',
    },
    orText: {
        marginHorizontal: 10,
        color: '#999',
        fontSize: 12,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 16,
        gap: 10,
    },
    socialText: {
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#777',
        fontSize: 14,
    },
    signupLink: {
        color: '#FF9F1C',
        fontWeight: '700',
        fontSize: 14,
    },
})
