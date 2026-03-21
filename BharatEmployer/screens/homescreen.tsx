import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'

import SearchInput from '../components/SearchInput'
import PrimaryButton from '../components/PrimaryButton'
import WorkerCard from '../components/WorkerCard'
import api from '../lib/api'

export default function HomeScreen() {
    const navigation = useNavigation()
    const [workers, setWorkers] = useState<any[]>([])

    useEffect(() => {
        fetchWorkers()
    }, [])

    const fetchWorkers = async () => {
        try {
            // Mocking or hitting potential worker list endpoint
            // const response = await api.get('/users/workers?limit=4');
            // setWorkers(response.data.workers);
            setWorkers([]);
        } catch (e) {
            console.log("Mock worker fetch failed", e);
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/100' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.greeting}>Hi Employer</Text>
                            <Text style={styles.subGreeting}>Good Morning</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.bell}>
                        <Icon name="notifications-outline" size={24} color="#1E2C63" />
                    </TouchableOpacity>
                </View>

                {/* SEARCH */}
                <SearchInput style={{ margin: 20 }} />

                {/* BANNER */}
                <View style={styles.banner}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerTitle}>Get Your Work Done</Text>
                        <Text style={styles.bannerSub}>For Every Work Contact</Text>
                        <PrimaryButton
                            title="Hire Now"
                            style={styles.bannerBtn}
                            textStyle={styles.bannerBtnText}
                        />
                    </View>

                    <Image
                        source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
                        }}
                        style={styles.bannerImg}
                    />
                </View>

                {/* SECTION TITLE */}
                <Text style={styles.sectionTitle}>
                    Get Your Work
                    <Text style={styles.sectionHighlight}> Done with Ease</Text>
                </Text>

                {/* WORKERS GRID */}
                <View style={styles.grid}>
                    {workers.map((worker) => (
                        <WorkerCard
                            key={worker.id}
                            name={worker.users?.name || 'Worker'}
                            role="Labour" // Hardcoded role for now, or fetch from schema if exists
                            price={`₹ ${worker.expected_wage}/- Day`}
                            imageUri={`https://i.pravatar.cc/150?u=${worker.id}`}
                        />
                    ))}
                    {workers.length === 0 && <Text style={{ marginLeft: 20, color: '#777' }}>No workers found.</Text>}
                </View>
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
        paddingHorizontal: 20,
        marginTop: 10,
        alignItems: 'center',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FF9F1C', // Orange border
    },

    greeting: {
        fontSize: 14,
        fontWeight: '600',
    },

    subGreeting: {
        fontSize: 12,
        color: '#777',
    },

    bell: {
        padding: 10,
        backgroundColor: 'transparent',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#1E2C63',
    },

    banner: {
        marginHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#3F5BD9',
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },

    bannerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },

    bannerSub: {
        color: '#DADFFF',
        fontSize: 12,
        marginVertical: 6,
    },

    bannerBtn: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 18,
        marginTop: 10,
        alignSelf: 'flex-start',
    },

    bannerBtnText: {
        fontSize: 14,
    },

    bannerImg: {
        width: 80,
        height: 80,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginHorizontal: 20,
        marginTop: 24,
    },

    sectionHighlight: {
        color: '#FF9F1C',
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
    },
})
