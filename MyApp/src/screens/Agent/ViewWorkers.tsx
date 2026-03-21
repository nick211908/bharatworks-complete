import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WorkerService } from '../../services/WorkerService';
import { useFocusEffect } from '@react-navigation/native';

// type WorkerStatus = 'verified' | 'pending' | 'failed'; // Simplification for now

interface Worker {
  id: string;
  name: string;
  skill: string;
  phone: string;
  // location: string; // The table uses location_lat/lng
  created_at: string;
  is_verified: boolean;
  aadhaar_number?: string;
}


const ViewWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkers();
    }, [])
  );

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await WorkerService.getOfflineWorkers();
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const filteredWorkers = workers.filter(worker => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return worker.is_verified;
    if (activeFilter === 'pending') return !worker.is_verified;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>वर्कर्स लिस्ट</Text>
        <Text style={styles.headerSubtitle}>View Onboarded Workers</Text>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search by name or phone..."
            placeholderTextColor="#777"
            style={styles.searchInput}
          />
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {['all', 'verified', 'pending', 'failed'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                activeFilter === type && styles.filterActive,
              ]}
              onPress={() => setActiveFilter(type as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === type && styles.filterActiveText,
                ]}
              >
                {type === 'all'
                  ? 'All'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading workers...</Text> : filteredWorkers.map(worker => (
          <View
            key={worker.id}
            style={[
              styles.workerCard,
              worker.is_verified ? styles.verifiedBorder : styles.pendingBorder,
            ]}
          >
            {/* HEADER */}
            <View style={styles.cardHeader}>
              <Text style={styles.workerName}>{worker.name}</Text>

              <View
                style={[
                  styles.statusBadge,
                  worker.is_verified ? styles.verifiedBadge : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    worker.is_verified ? styles.verifiedText : styles.pendingText,
                  ]}
                >
                  {worker.is_verified ? '✔ Verified' : '⏰ Pending'}
                </Text>
              </View>
            </View>

            <Text style={styles.workerInfo}>{worker.skill}</Text>
            <Text style={styles.workerInfo}>📞 {worker.phone}</Text>
            {/* <Text style={styles.workerInfo}>📍 {worker.location}</Text> */}
            <Text style={styles.workerInfo}>
              🕒 Onboarded: {new Date(worker.created_at).toLocaleDateString()}
            </Text>

          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewWorkers;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    backgroundColor: '#FF9F1C',
    padding: 16,
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },

  headerSubtitle: {
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 10,
  },

  searchBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
  },

  searchInput: {
    fontSize: 14,
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  filterChip: {
    backgroundColor: '#FF9F1C',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },

  filterActive: {
    backgroundColor: '#FFF',
  },

  filterText: {
    color: '#FFF',
    fontWeight: '500',
  },

  filterActiveText: {
    color: '#3F5BD9',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  workerCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },

  verifiedBorder: { borderColor: '#9BE3B3' },
  pendingBorder: { borderColor: '#FFB570' },
  failedBorder: { borderColor: '#FF9A9A' },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  workerName: {
    fontSize: 16,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedBadge: { backgroundColor: '#E6F8ED' },
  pendingBadge: { backgroundColor: '#FFE8D6' },
  failedBadge: { backgroundColor: '#FFE6E6' },

  statusText: { fontWeight: '600' },
  verifiedText: { color: '#1EAD5A' },
  pendingText: { color: '#FF6A00' },
  failedText: { color: '#FF0000' },

  workerInfo: {
    color: '#555',
    marginBottom: 4,
  },

  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },

  errorTitle: {
    color: '#FF0000',
    fontWeight: '600',
  },

  errorText: {
    color: '#FF0000',
  },

  linkButton: {
    marginTop: 12,
    backgroundColor: '#FFF3CD',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  linkText: {
    color: '#8A6D00',
    fontWeight: '600',
  },
});
