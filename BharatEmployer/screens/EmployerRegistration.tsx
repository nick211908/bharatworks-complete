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

export default function EmployerRegistration() {
    const navigation = useNavigation<any>()
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
            Alert.alert('Validation Error', 'Please enter company/business name')
            return
        }

        if (!billingAddress.trim()) {
            Alert.alert('Validation Error', 'Please enter billing address')
            return
        }

        if (!phone.trim()) {
            Alert.alert('Validation Error', 'Please enter phone number')
            return
        }

        if (employerType !== 'individual') {
            if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
                Alert.alert('Validation Error', 'Please fill all banking details')
                return
            }
        }

        if (!userId) {
            Alert.alert('Error', 'User not found. Please log in again.')
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

            Alert.alert('Success', 'Employer profile created successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        DeviceEventEmitter.emit('AUTH_PROFILE_COMPLETE')
                    },
                },
            ])
        } catch (err: any) {
            console.error(err)
            if (err.response?.status === 400 || err.response?.data?.error?.includes('exists')) {
                await AsyncStorage.setItem('employerProfileComplete', 'true')
                Alert.alert('Already Registered', 'Your employer profile already exists.', [
                    { text: 'OK', onPress: () => DeviceEventEmitter.emit('AUTH_PROFILE_COMPLETE') }
                ])
            } else {
                Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to register employer')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFDF8" />

            <View style={styles.header}>
                <Text style={styles.title}>Complete Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.label}>Employer Type</Text>
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
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Company / Business Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    value={companyName}
                    onChangeText={setCompanyName}
                />

                <Text style={styles.label}>Billing Address</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Enter full address"
                    multiline
                    value={billingAddress}
                    onChangeText={setBillingAddress}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="+91 9876543210"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />

                {employerType !== 'individual' && (
                    <>
                        <Text style={styles.sectionHeader}>Bank Details</Text>

                        <Text style={styles.label}>Bank Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="HDFC Bank"
                            value={bankName}
                            onChangeText={setBankName}
                        />

                        <Text style={styles.label}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1234567890"
                            keyboardType="numeric"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                        />

                        <Text style={styles.label}>IFSC Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="HDFC0001234"
                            autoCapitalize="characters"
                            value={ifscCode}
                            onChangeText={setIfscCode}
                        />
                    </>
                )}

                <PrimaryButton
                    title={loading ? "Saving..." : "Save & Continue"}
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
