import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BulkOnboarding = ({ navigation }: any) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>बल्क ऑनबोर्डिंग</Text>
          <Text style={styles.headerSubtitle}>Bulk Onboarding</Text>
        </View>

        <View style={styles.onlineBadge}>
          <Text style={styles.onlineText}>📶 Online</Text>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Offline</Text>
          <Text style={styles.statValue}>1</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>1</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Synced</Text>
          <Text style={styles.statValue}>1</Text>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ADD NEW WORKER */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addText}>＋ Add New Worker</Text>
        </TouchableOpacity>

        {/* OFFLINE CARD */}
        <View style={styles.workerCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.workerName}>राम प्रसाद</Text>
            <View style={styles.offlineBadge}>
              <Text style={styles.badgeText}>Saved Offline</Text>
            </View>
          </View>

          <Text style={styles.workerText}>+91 9876543210</Text>
          <Text style={styles.workerText}>Construction</Text>

          <View style={styles.uuidBox}>
            <Text style={styles.uuidText}>Client UUID:</Text>
            <Text style={styles.uuidValue}>WKR-LOCAL-001</Text>
          </View>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>
        </View>

        {/* SYNCED CARD */}
        <View style={[styles.workerCard, styles.syncedBorder]}>
          <View style={styles.cardHeader}>
            <Text style={styles.workerName}>सुरेश कुमार</Text>
            <View style={styles.syncedBadge}>
              <Text style={styles.syncedText}>✔ Synced</Text>
            </View>
          </View>

          <Text style={styles.workerText}>+91 9876543211</Text>
          <Text style={styles.workerText}>Plumber</Text>

          <View style={styles.uuidBox}>
            <Text style={styles.uuidText}>Client UUID:</Text>
            <Text style={styles.uuidValue}>WKR-LOCAL-002</Text>
          </View>
        </View>

        {/* PENDING CARD */}
        <View style={[styles.workerCard, styles.pendingBorder]}>
          <View style={styles.cardHeader}>
            <Text style={styles.workerName}>मोहन सिंह</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>⏰ Pending</Text>
            </View>
          </View>

          <Text style={styles.workerText}>+91 9876543212</Text>
          <Text style={styles.workerText}>Electrician</Text>

          <View style={styles.uuidBox}>
            <Text style={styles.uuidText}>Client UUID:</Text>
            <Text style={styles.uuidValue}>WKR-LOCAL-003</Text>
          </View>
        </View>
      </ScrollView>

      {/* SYNC ALL */}
      <TouchableOpacity style={styles.syncAllButton}>
        <Text style={styles.syncAllText}>⬆ Sync All (2 workers)</Text>
      </TouchableOpacity>

      {/* MODAL PLACEHOLDER */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Worker to Queue</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.modalInput} placeholder="Worker name" />
              <TextInput
                style={styles.modalInput}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
              <TextInput style={styles.modalInput} placeholder="Skill" />
              <TextInput style={styles.modalInput} placeholder="Experience" />
              <TextInput
                style={styles.modalInput}
                placeholder="Daily Wage"
                keyboardType="numeric"
              />
              <TextInput style={styles.modalInput} placeholder="Location" />

              {/* PHOTO */}
              <Text style={styles.sectionLabel}>Photo</Text>
              <TouchableOpacity style={styles.uploadBox}>
                <Text style={styles.uploadText}>⬆ Upload Photo</Text>
              </TouchableOpacity>

              {/* AADHAAR */}
              <Text style={styles.sectionLabel}>Aadhaar</Text>
              <TouchableOpacity style={styles.uploadBox}>
                <Text style={styles.uploadText}>⬆ Upload Aadhaar</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.addQueueBtn}>
                <Text style={styles.addQueueText}>Add to Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BulkOnboarding;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },

  header: {
    backgroundColor: '#FF9F1C',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },

  headerSubtitle: {
    color: '#FFF',
    opacity: 0.9,
  },

  onlineBadge: {
    backgroundColor: '#9AC3A3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  onlineText: {
    color: '#FFF',
    fontWeight: '500',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FF9F1C',
    paddingBottom: 20,
  },

  statBox: {
    backgroundColor: '#FF9F1C',
    width: 90,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statLabel: {
    color: '#FFF',
  },

  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  addButton: {
    backgroundColor: '#3F5BD9',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
  },

  addText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  workerCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },

  syncedBorder: {
    borderColor: '#8FE0B0',
  },

  pendingBorder: {
    borderColor: '#FFB570',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  workerName: {
    fontSize: 16,
    fontWeight: '600',
  },

  workerText: {
    color: '#555',
    marginBottom: 4,
  },

  uuidBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  uuidText: {
    color: '#777',
  },

  uuidValue: {
    fontWeight: '600',
  },

  offlineBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: '#555',
  },

  syncedBadge: {
    backgroundColor: '#E6F8ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  syncedText: {
    color: '#1EAD5A',
    fontWeight: '600',
  },

  pendingBadge: {
    backgroundColor: '#FFE8D6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  pendingText: {
    color: '#FF6A00',
    fontWeight: '600',
  },

  deleteButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5E5',
    padding: 8,
    borderRadius: 12,
  },

  deleteText: {
    color: '#D80000',
    fontSize: 16,
  },

  syncAllButton: {
    backgroundColor: '#FF9F1C',
    paddingVertical: 18,
    alignItems: 'center',
  },

  syncAllText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  modalClose: {
    alignSelf: 'flex-end',
    padding: 16,
  },

  closeText: {
    fontSize: 18,
  },

  modalPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 6,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  uploadText: {
    color: '#777',
    fontSize: 14,
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  addQueueBtn: {
    backgroundColor: '#3F5BD9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },

  addQueueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  cancelBtn: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
