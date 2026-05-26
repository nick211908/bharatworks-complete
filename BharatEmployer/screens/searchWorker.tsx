import React, { useCallback, useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'
import SearchInput from '../components/SearchInput'
import HelperCard from '../components/HelperCard'
import api from '../lib/api'
import { useTranslation } from 'react-i18next'

export default function SearchHelperScreen() {
    const { t } = useTranslation()
    const [workers, setWorkers] = useState<any[]>([])
    const [searchText, setSearchText] = useState('')

    const fetchWorkers = useCallback(async () => {
        try {
            const response = await api.get(`/users/workers?search=${encodeURIComponent(searchText)}`)
            setWorkers(Array.isArray(response.data?.workers) ? response.data.workers : [])
        } catch (e) {
            console.log('Worker search failed', e)
            setWorkers([])
        }
    }, [searchText])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchWorkers()
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [fetchWorkers])

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Icon name="chevron-back" size={26} color="#000" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{t('search.headerTitle')}</Text>

                    <TouchableOpacity style={styles.bell}>
                        <Icon name="notifications-outline" size={20} color="#1E2C63" />
                    </TouchableOpacity>
                </View>

                {/* SEARCH BAR */}
                <SearchInput
                    style={{ margin: 20, marginBottom: 10 }}
                    placeholder={t('search.placeholder')}
                    value={searchText}
                    onChangeText={setSearchText}
                />

                {/* CARDS */}
                {workers.map((worker) => (
                    <HelperCard
                        key={worker.id}
                        name={worker.user?.name || worker.users?.name || t('common.noData')}
                        role={t('home.workerRole')}
                        image={`https://i.pravatar.cc/400?u=${worker.id}`}
                        wage={`₹ ${worker.expectedWage ?? worker.expected_wage ?? 'N/A'}${t('home.perDay')}`}
                    />
                ))}

                {workers.length === 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                        {t('search.noWorkers')}
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FFFDF8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    bell: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#1E2C63',
        borderRadius: 50,
    },
})
