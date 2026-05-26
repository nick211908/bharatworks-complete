import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    TouchableWithoutFeedback
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

interface LocationSelectorProps {
    currentLocation: string
    onLocationChange: (location: string) => void
}

export default function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
    const { t } = useTranslation()
    const [modalVisible, setModalVisible] = useState(false)
    const [tempLocation, setTempLocation] = useState(currentLocation)

    const handleSave = () => {
        onLocationChange(tempLocation)
        setModalVisible(false)
    }

    return (
        <>
            <View style={styles.card}>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{t('loc.location')}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={styles.change}>{t('loc.change')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.locationRow}>
                    <Icon name="location-sharp" size={22} color="#FF6B3D" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.locationMain}>{t('loc.useCurrent')}</Text>
                        <Text style={styles.locationSub} numberOfLines={2}>
                            {currentLocation}
                        </Text>
                    </View>
                </View>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{t('loc.changeTitle')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('loc.enterLocation')}
                                value={tempLocation}
                                onChangeText={setTempLocation}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.cancelBtn]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelText}>{t('loc.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.saveBtn]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveText}>{t('loc.save')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 20,
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
    change: { color: '#FF9F1C', fontSize: 12 },
    locationRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        alignItems: 'center'
    },
    locationMain: { fontSize: 13, fontWeight: '600' },
    locationSub: { fontSize: 12, color: '#777', marginTop: 2, flexWrap: 'wrap' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F2F2F2',
    },
    saveBtn: {
        backgroundColor: '#FF9F1C',
    },
    cancelText: { color: '#777', fontWeight: '600' },
    saveText: { color: '#FFF', fontWeight: '600' },
})
