import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Platform,
    PermissionsAndroid,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import DateTimePicker from '@react-native-community/datetimepicker'
import Geolocation from 'react-native-geolocation-service'

import { useNavigation } from '@react-navigation/native'
import PrimaryButton from '../components/PrimaryButton'
import LocationSelector from '../components/LocationSelector'
import api from '../lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'

export default function QuickJobPostScreen() {
    const { t } = useTranslation()
    const navigation = useNavigation()
    const [quantity, setQuantity] = useState(1)
    const [wage, setWage] = useState('650')
    const [currentLocation, setCurrentLocation] = useState(t('job.fetchingLocation'))
    const [loading, setLoading] = useState(false)
    const [employerId, setEmployerId] = useState<string | null>(null)
    const [startDate, setStartDate] = useState(new Date())
    const [startTime, setStartTime] = useState(new Date())
    const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 9 * 60 * 60 * 1000))
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showStartTimePicker, setShowStartTimePicker] = useState(false)
    const [showEndTimePicker, setShowEndTimePicker] = useState(false)

    // Add state for storing lat/lng
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)

    useEffect(() => {
        fetchEmployerId()
        requestLocationPermission()
    }, [])

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: t('job.permTitle'),
                        message: t('job.permMsg'),
                        buttonNeutral: t('job.permNeutral'),
                        buttonNegative: t('job.permNegative'),
                        buttonPositive: t('job.permPositive')
                    }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation()
                } else {
                    console.log("Location permission denied")
                    setCurrentLocation(t('job.locationDenied'))
                }
            } catch (err) {
                console.warn(err)
            }
        } else {
            getCurrentLocation()
        }
    }

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCoords({ lat: latitude, lng: longitude })
                setCurrentLocation(t('job.latLng', { lat: latitude.toFixed(4), lng: longitude.toFixed(4) }))
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message)
                setCurrentLocation(t('job.locationError'))
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )
    }

    const fetchEmployerId = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            if (id) setEmployerId(id);
        } catch (e) {
            console.error(e);
        }
    }

    const handleDateChange = (event: any, selectedDate: any) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setStartDate(selectedDate)
        }
    }

    const handleStartTimeChange = (event: any, selectedTime: any) => {
        setShowStartTimePicker(false)
        if (selectedTime) {
            setStartTime(selectedTime)
        }
    }

    const handleEndTimeChange = (event: any, selectedTime: any) => {
        setShowEndTimePicker(false)
        if (selectedTime) {
            setEndTime(selectedTime)
        }
    }

    const handlePostJob = async () => {
        if (!employerId) {
            Alert.alert(t('auth.validationError'), t('job.errProfileNotLoaded'))
            return
        }

        if (!coords) {
            Alert.alert(t('auth.validationError'), t('job.errLocationMissing'))
            return
        }

        setLoading(true)

        // Combine date and time
        const fullStartTime = new Date(startDate)
        fullStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0)

        const fullEndTime = new Date(startDate)
        fullEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0)

        try {
            await api.post('/jobs', {
                title: t('job.defaultJobTitle'),
                count: quantity,
                wagePerDay: parseFloat(wage) || 650.00,
                lat: coords.lat,
                lng: coords.lng,
                urgent: false,
                slotsTotal: quantity,
                startTime: fullStartTime.toISOString(),
                endTime: fullEndTime.toISOString()
            });

            Alert.alert(t('job.successTitle'), t('job.successMsg'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert(t('auth.validationError'), error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{t('job.title')}</Text>
                        <Text style={styles.subtitle}>{t('job.subtitle')}</Text>
                    </View>

                    <TouchableOpacity>
                        <Icon name="notifications-outline" size={22} color="#FF9F1C" />
                    </TouchableOpacity>
                </View>

                {/* JOB DETAILS */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('job.details')}</Text>

                    <View style={styles.rowBetween}>
                        <View style={styles.qtyBox}>
                            <Text style={styles.label}>{t('job.quantity')}</Text>
                            <View style={styles.qtyControl}>
                                <TouchableOpacity
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Text style={styles.qtyBtn}>−</Text>
                                </TouchableOpacity>

                                <Text style={styles.qtyValue}>{quantity}</Text>

                                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                    <Text style={styles.qtyBtn}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.priceBox}>
                            <Text style={styles.label}>{t('job.dailyWage')}</Text>
                            <TextInput
                                style={styles.wageInput}
                                value={wage}
                                onChangeText={setWage}
                                keyboardType="numeric"
                                placeholder={t('job.wagePlaceholder')}
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.fullWidth}>
                        <TouchableOpacity
                            style={styles.dateTimeRow}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Icon name="calendar-outline" size={18} color="#1E2C63" />
                            <Text style={styles.inlineText}>{startDate.toDateString()}</Text>
                        </TouchableOpacity>

                        <View style={styles.timeRow}>
                            <TouchableOpacity
                                style={styles.timeInput}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Icon name="time-outline" size={16} color="#1E2C63" />
                                <Text style={styles.timeText}>{startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                            </TouchableOpacity>

                            <Text style={styles.timeDash}>-</Text>

                            <TouchableOpacity
                                style={styles.timeInput}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Icon name="time-outline" size={16} color="#1E2C63" />
                                <Text style={styles.timeText}>{endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* LOCATION */}
                <LocationSelector
                    currentLocation={currentLocation}
                    onLocationChange={setCurrentLocation}
                />

                {/* POST BUTTON */}
                <PrimaryButton
                    title={loading ? t('job.posting') : t('job.postJob')}
                    style={styles.postBtn}
                    onPress={handlePostJob}
                />

                {/* DATE PICKER */}
                {showDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}

                {/* START TIME PICKER */}
                {showStartTimePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleStartTimeChange}
                    />
                )}

                {/* END TIME PICKER */}
                {showEndTimePicker && (
                    <DateTimePicker
                        value={endTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleEndTimeChange}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

/* ================= COMPONENTS ================= */

function Tag({ title }: any) {
    return (
        <View style={styles.tag}>
            <Text style={styles.tagText}>{title}</Text>
        </View>
    )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F9F9F9' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },

    title: { fontSize: 18, fontWeight: '700' },
    subtitle: { fontSize: 12, color: '#777', marginTop: 4 },

    card: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },

    cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    qtyBox: { flex: 1 },
    label: { fontSize: 12, color: '#777' },

    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    qtyBtn: {
        fontSize: 22,
        width: 32,
        textAlign: 'center',
    },

    qtyValue: {
        fontSize: 14,
        marginHorizontal: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#FFF7ED',
    },

    priceBox: { flex: 1, alignItems: 'flex-end' },
    price: { fontSize: 16, fontWeight: '700' },
    perDay: { fontSize: 12, color: '#777' },

    wageInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        marginTop: 6,
        textAlign: 'right',
    },

    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 12,
    },

    fullWidth: { width: '100%' },

    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },

    timeInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 6,
    },

    timeText: { fontSize: 12, color: '#1E2C63', fontWeight: '600' },
    timeDash: { fontSize: 16, color: '#999', marginTop: 10 },

    inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    inlineText: { fontSize: 12 },

    tagRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },

    tag: {
        backgroundColor: '#EEE',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    tagText: { fontSize: 12 },

    notes: {
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        padding: 10,
        fontSize: 12,
    },

    postBtn: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
})
