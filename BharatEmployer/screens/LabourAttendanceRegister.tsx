import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import api from '../lib/api'
import { useTranslation } from 'react-i18next'

type AttendanceStatus = 'PRESENT' | 'HALF' | 'ABSENT' | 'PENDING'
type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

interface AttendanceRecord {
    date: string
    status: AttendanceStatus
    wage: number
    amountPaid: number
    paymentStatus: PaymentStatus
}

interface Worker {
    id: string
    name: string
    phone: string
    wage: number
    dues: number
    totalEarned: number
    totalPaid: number
    attendance: AttendanceRecord[]
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
    PRESENT: '#4CAF50',
    HALF: '#FFB703',
    ABSENT: '#F44336',
    PENDING: '#E0E0E0',
}

const getStatusLabels = (t: any): Record<AttendanceStatus, string> => ({
    PRESENT: t('attendance.presentLabel'),
    HALF: t('attendance.halfDayLabel'),
    ABSENT: t('attendance.absentLabel'),
    PENDING: '-',
})

export default function LabourAttendanceRegister() {
    const { t } = useTranslation()
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [dates, setDates] = useState<string[]>([])
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [paymentModalVisible, setPaymentModalVisible] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [processing, setProcessing] = useState(false)

    // Generate last 7 days
    const generateDates = useCallback(() => {
        const dates: string[] = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dates.push(d.toISOString().split('T')[0])
        }
        return dates
    }, [])

    const fetchAttendance = async () => {
        try {
            setError(null)
            const dateRange = generateDates()
            setDates(dateRange)

            const response = await api.get('/users/employer/workers-attendance', {
                params: {
                    startDate: dateRange[0],
                    endDate: dateRange[dateRange.length - 1],
                },
            })

            setWorkers(response.data?.workers || [])
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || t('attendance.fetchError')
            console.error('Attendance fetch error:', err?.response?.status, msg)
            setError(msg)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAttendance()
    }, [])

    const onRefresh = () => {
        setRefreshing(true)
        fetchAttendance()
    }

    const getAttendanceForDate = (worker: Worker, date: string): AttendanceRecord | undefined => {
        return worker.attendance.find(a => a.date === date)
    }

    const markAttendance = async (workerId: string, date: string, status: AttendanceStatus) => {
        try {
            const worker = workers.find(w => w.id === workerId)
            if (!worker) return

            await api.post('/users/employer/attendance/mark', {
                workerId,
                date,
                status,
                wage: worker.wage,
            })

            // Update local state
            setWorkers(prev =>
                prev.map(w => {
                    if (w.id !== workerId) return w

                    const existingIndex = w.attendance.findIndex(a => a.date === date)
                    const newAttendance = [...w.attendance]

                    if (existingIndex >= 0) {
                        newAttendance[existingIndex] = {
                            ...newAttendance[existingIndex],
                            status,
                        }
                    } else {
                        newAttendance.push({
                            date,
                            status,
                            wage: worker.wage,
                            amountPaid: 0,
                            paymentStatus: 'UNPAID',
                        })
                    }

                    return { ...w, attendance: newAttendance }
                })
            )

            setSelectedWorker(null)
            setSelectedDate(null)
        } catch (error: any) {
            Alert.alert(t('auth.validationError'), error?.response?.data?.error || t('attendance.markError'))
        }
    }

    const processPayment = async () => {
        if (!selectedWorker || !paymentAmount) return

        const amount = parseFloat(paymentAmount)
        if (isNaN(amount) || amount <= 0) {
            Alert.alert(t('attendance.invalidAmountTitle'), t('attendance.invalidAmount'))
            return
        }

        try {
            setProcessing(true)
            await api.post(`/users/employer/workers/${selectedWorker.id}/pay`, {
                workerId: selectedWorker.id,
                amount,
            })

            Alert.alert(t('job.successTitle'), t('attendance.paymentSuccess', { amount }))
            setPaymentModalVisible(false)
            setPaymentAmount('')
            fetchAttendance()
        } catch (error: any) {
            Alert.alert(t('auth.validationError'), error?.response?.data?.error || t('attendance.paymentError'))
        } finally {
            setProcessing(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(t('common.language') === 'Hindi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })
    }

    const formatDay = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(t('common.language') === 'Hindi' ? 'hi-IN' : 'en-IN', { weekday: 'short' })
    }

    const calculateDayTotal = (date: string) => {
        let total = 0
        workers.forEach(worker => {
            const att = getAttendanceForDate(worker, date)
            if (att?.status === 'PRESENT') total += worker.wage
            else if (att?.status === 'HALF') total += worker.wage / 2
        })
        return total
    }

    const calculateGrandTotal = () => {
        return workers.reduce((sum, w) => sum + (w.dues > 0 ? w.dues : 0), 0)
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E2C60" />
                    <Text style={styles.loadingText}>{t('attendance.loading')}</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingContainer}>
                    <Icon name="cloud-offline-outline" size={48} color="#F44336" />
                    <Text style={[styles.loadingText, { color: '#F44336', marginTop: 12 }]}>{t('attendance.errorTitle')}</Text>
                    <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 32 }}>{error}</Text>
                    <TouchableOpacity
                        onPress={() => { setLoading(true); fetchAttendance() }}
                        style={{ marginTop: 20, backgroundColor: '#1E2C60', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>{t('attendance.retry')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('attendance.title')}</Text>
                <Text style={styles.subtitle}>{dates.length > 0 && `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`}</Text>
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryNumber}>{workers.length}</Text>
                        <Text style={styles.summaryLabel}>{t('attendance.workers')}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNumber, styles.dueAmount]}>
                            ₹{calculateGrandTotal().toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>{t('attendance.totalDues')}</Text>
                    </View>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.PRESENT }]} />
                    <Text style={styles.legendText}>{t('attendance.present')}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.HALF }]} />
                    <Text style={styles.legendText}>{t('attendance.halfDay')}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.ABSENT }]} />
                    <Text style={styles.legendText}>{t('attendance.absent')}</Text>
                </View>
            </View>

            {/* Attendance Table */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.tableContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View>
                    {/* Table Header */}
                    <View style={[styles.row, styles.headerRow]}>
                        <View style={[styles.cell, styles.nameCell]}>
                            <Text style={styles.headerText}>{t('attendance.worker')}</Text>
                        </View>
                        <View style={[styles.cell, styles.duesCell]}>
                            <Text style={styles.headerText}>{t('attendance.dues')}</Text>
                        </View>
                        {dates.map(date => (
                            <View key={date} style={styles.dateCell}>
                                <Text style={styles.dateDay}>{formatDay(date)}</Text>
                                <Text style={styles.dateNum}>{new Date(date).getDate()}</Text>
                            </View>
                        ))}
                        <View style={[styles.cell, styles.actionCell]}>
                            <Text style={styles.headerText}>{t('attendance.pay')}</Text>
                        </View>
                    </View>

                    {/* Worker Rows */}
                    {workers.length === 0 ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <Icon name="people-outline" size={40} color="#CCC" />
                            <Text style={{ color: '#AAA', marginTop: 12, fontSize: 14, textAlign: 'center' }}>
                                {t('attendance.noWorkers')}
                            </Text>
                        </View>
                    ) : workers.map(worker => (
                        <View key={worker.id} style={styles.row}>
                            {/* Worker Name */}
                            <View style={[styles.cell, styles.nameCell]}>
                                <Text style={styles.workerName}>{worker.name}</Text>
                                <Text style={styles.workerPhone}>₹{worker.wage}{t('home.perDay')}</Text>
                            </View>

                            {/* Dues */}
                            <View style={[styles.cell, styles.duesCell]}>
                                <TouchableOpacity 
                                    onPress={() => {
                                        if (worker.dues > 0) {
                                            setSelectedWorker(worker)
                                            setPaymentModalVisible(true)
                                        }
                                    }}
                                    disabled={worker.dues <= 0}
                                >
                                    <Text style={[styles.duesText, worker.dues > 0 && styles.duesPending, { textDecorationLine: worker.dues > 0 ? 'underline' : 'none' }]}>
                                        ₹{worker.dues.toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Attendance Cells */}
                            {dates.map(date => {
                                const att = getAttendanceForDate(worker, date)
                                const status = att?.status || 'PENDING'
                                const isPaid = att?.paymentStatus === 'PAID'
                                const isPartial = att?.paymentStatus === 'PARTIAL'

                                return (
                                    <TouchableOpacity
                                        key={`${worker.id}-${date}`}
                                        style={[
                                            styles.attendanceCell,
                                            { backgroundColor: STATUS_COLORS[status] },
                                            (isPaid || isPartial) && styles.paidCell,
                                        ]}
                                        onPress={() => {
                                            setSelectedWorker(worker)
                                            setSelectedDate(date)
                                        }}
                                    >
                                        <Text style={styles.statusText}>
                                            {getStatusLabels(t)[status]}
                                        </Text>
                                        {isPartial && <View style={styles.partialIndicator} />}
                                    </TouchableOpacity>
                                )
                            })}

                            {/* Pay Button */}
                            <View style={[styles.cell, styles.actionCell]}>
                                <TouchableOpacity
                                    style={[styles.payBtn, worker.dues <= 0 && styles.payBtnDisabled]}
                                    onPress={() => {
                                        setSelectedWorker(worker)
                                        setPaymentModalVisible(true)
                                    }}
                                    disabled={worker.dues <= 0}
                                >
                                    <Icon name="cash-outline" size={18} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {/* Day Total Row */}
                    <View style={[styles.row, styles.totalRow]}>
                        <View style={[styles.cell, styles.nameCell]}>
                            <Text style={styles.totalText}>{t('attendance.dayTotal')}</Text>
                        </View>
                        <View style={[styles.cell, styles.duesCell]}>
                            <Text style={styles.totalText}>-</Text>
                        </View>
                        {dates.map(date => (
                            <View key={`total-${date}`} style={styles.attendanceCell}>
                                <Text style={styles.dayTotalText}>
                                    ₹{calculateDayTotal(date).toLocaleString()}
                                </Text>
                            </View>
                        ))}
                        <View style={[styles.cell, styles.actionCell]}>
                            <Text style={styles.totalText}>-</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Attendance Modal */}
            <Modal
                visible={!!selectedWorker && !!selectedDate && !paymentModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setSelectedWorker(null)
                    setSelectedDate(null)
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('attendance.markTitle')}</Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedWorker?.name} - {selectedDate && formatDate(selectedDate)}
                        </Text>

                        <View style={styles.statusButtons}>
                            {(['PRESENT', 'HALF', 'ABSENT'] as AttendanceStatus[]).map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusBtn,
                                        { backgroundColor: STATUS_COLORS[status] },
                                    ]}
                                    onPress={() =>
                                        selectedWorker &&
                                        selectedDate &&
                                        markAttendance(selectedWorker.id, selectedDate, status)
                                    }
                                >
                                    <Text style={styles.statusBtnText}>
                                        {status === 'PRESENT' ? t('attendance.present') : status === 'HALF' ? t('attendance.halfDay') : t('attendance.absent')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => {
                                setSelectedWorker(null)
                                setSelectedDate(null)
                            }}
                        >
                            <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Payment Modal */}
            <Modal
                visible={paymentModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setPaymentModalVisible(false)
                    setPaymentAmount('')
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('attendance.makePayment')}</Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedWorker?.name}
                        </Text>

                        <View style={styles.paymentInfo}>
                            <View style={styles.paymentInfoRow}>
                                <Text style={styles.paymentInfoLabel}>{t('attendance.totalEarned')}</Text>
                                <Text style={styles.paymentInfoValue}>₹{selectedWorker?.totalEarned.toLocaleString()}</Text>
                            </View>
                            <View style={styles.paymentInfoRow}>
                                <Text style={styles.paymentInfoLabel}>{t('attendance.totalPaid')}</Text>
                                <Text style={styles.paymentInfoValue}>₹{selectedWorker?.totalPaid.toLocaleString()}</Text>
                            </View>
                            <View style={styles.paymentInfoRow}>
                                <Text style={styles.paymentInfoLabel}>{t('attendance.balanceDue')}</Text>
                                <Text style={[styles.paymentInfoValue, styles.dueAmount]}>
                                    ₹{selectedWorker?.dues.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>{t('attendance.paymentAmount')}</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                            keyboardType="numeric"
                            placeholder={t('attendance.enterAmount')}
                            placeholderTextColor="#999"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setPaymentModalVisible(false)
                                    setPaymentAmount('')
                                    setSelectedWorker(null)
                                }}
                            >
                                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, processing && styles.confirmBtnDisabled]}
                                onPress={processPayment}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={styles.confirmBtnText}>{t('attendance.payNow')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F8F9FC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 14,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: '#1E2C60',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    dueAmount: {
        color: '#FFB703',
    },
    summaryLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    tableContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerRow: {
        backgroundColor: '#1E2C60',
        borderBottomWidth: 0,
    },
    totalRow: {
        backgroundColor: '#F0F4FF',
        borderTopWidth: 2,
        borderTopColor: '#1E2C60',
    },
    cell: {
        padding: 12,
        justifyContent: 'center',
    },
    nameCell: {
        width: 140,
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
    },
    duesCell: {
        width: 90,
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        alignItems: 'flex-end',
    },
    dateCell: {
        width: 60,
        alignItems: 'center',
        paddingVertical: 8,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.1)',
    },
    attendanceCell: {
        width: 60,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
    },
    paidCell: {
        borderWidth: 2,
        borderColor: '#1E2C60',
    },
    actionCell: {
        width: 60,
        alignItems: 'center',
    },
    headerText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    dateDay: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    dateNum: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    workerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    workerPhone: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    duesText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
    duesPending: {
        color: '#F44336',
    },
    statusText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    partialIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1E2C60',
    },
    payBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBtnDisabled: {
        backgroundColor: '#CCC',
    },
    confirmBtn: {
        backgroundColor: '#1E2C60',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginLeft: 12,
        flex: 1,
        alignItems: 'center',
    },
    confirmBtnDisabled: {
        backgroundColor: '#CCC',
    },
    confirmBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    amountInput: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    totalText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E2C60',
    },
    dayTotalText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },
});
