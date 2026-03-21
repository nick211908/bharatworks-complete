import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  Modal,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';

import Geolocation from 'react-native-geolocation-service';
import { WorkerService } from '../../services/WorkerService';

const { width } = Dimensions.get('window');

const OnboardNewWorker = ({ navigation }: any) => {
  /* State */
  /* State */
  // const [photo, setPhoto] = useState<string | null>(null); // Replaced below
  const [location, setLocation] = useState<string>('Not tagged');
  const [locationTagged, setLocationTagged] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [skill, setSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [wage, setWage] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse location string back to numbers if needed, or better, store coords separately.
  const [coords, setCoords] = useState<{ latitude?: number, longitude?: number }>({});
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [aadhaarFront, setAadhaarFront] = useState<{ uri: string, base64?: string } | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<{ uri: string, base64?: string } | null>(null);
  const [photo, setPhoto] = useState<{ uri: string, base64?: string } | null>(null);

  const SKILLS = ['Helper', 'Construction', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner', 'Driver', 'Cook', 'Other'];
  const [selectedSkillTag, setSelectedSkillTag] = useState('');

  const selectSkill = (s: string) => {
    setSelectedSkillTag(s);
    if (s !== 'Other') {
      setSkill(s);
    } else {
      setSkill(''); // Clear for custom input
    }
  };

  const capturePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      cameraType: 'back',
      includeBase64: true,
    });

    if (result.assets && result.assets.length > 0) {
      setPhoto({
        uri: result.assets[0].uri || '',
        base64: result.assets[0].base64
      });
    }
  };

  const captureLocation = async () => {
    setLocationTagged(true);

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to tag it.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to tag location.');
          setLocationTagged(false);
          return;
        }
      } catch (err) {
        console.warn(err);
        setLocationTagged(false);
        return;
      }
    }

    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        setLocation(`Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
      },
      err => {
        console.log(err);
        Alert.alert('Location Error', err.message);
        setLocationTagged(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleRegister = async () => {
    // Validation
    if (!name || !mobile || !skill || !locationTagged) {
      Alert.alert('Missing Fields', 'Please fill Name, Mobile, Skill and Tag Location.');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;
      let frontUrl = null;
      let backUrl = null;

      if (photo) photoUrl = await WorkerService.uploadWorkerPhoto(photo);
      if (aadhaarFront) frontUrl = await WorkerService.uploadWorkerPhoto(aadhaarFront);
      if (aadhaarBack) backUrl = await WorkerService.uploadWorkerPhoto(aadhaarBack);

      await WorkerService.registerOfflineWorker({
        name,
        mobile,
        skill,
        experience,
        daily_wage: wage,
        latitude: coords.latitude,
        longitude: coords.longitude,
        photo_url: photoUrl || undefined,
        aadhaar_number: aadhaar,
        aadhaar_front_image: frontUrl || undefined,
        aadhaar_back_image: backUrl || undefined
      });

      Alert.alert('Success', 'Worker onboarded successfully!', [
        { text: 'OK', onPress: () => navigation.replace('AgentProfile') }
      ]);

    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const captureAadhaarImage = async (side: 'front' | 'back') => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      cameraType: 'back',
      includeBase64: true,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = {
        uri: result.assets[0].uri || '',
        base64: result.assets[0].base64
      };
      if (side === 'front') setAadhaarFront(asset);
      if (side === 'back') setAadhaarBack(asset);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>नया वर्कर</Text>
          <Text style={styles.headerSubtitle}>Onboard New Worker</Text>
        </View>

        {/* PHOTO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>फोटो / Photo</Text>
          <Text style={styles.required}>Required</Text>

          <TouchableOpacity style={styles.photoBox} onPress={capturePhoto}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.photo} />
            ) : (
              <>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.photoText}>Tap to capture photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* BASIC DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Details</Text>

          <Text style={styles.label}>पूरा नाम / Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>मोबाइल नंबर / Mobile *</Text>
          <View style={styles.row}>
            <View style={styles.countryCode}><Text>+91</Text></View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="phone-pad"
              placeholder="Mobile number"
              value={mobile}
              onChangeText={setMobile}
            />
          </View>
        </View>

        {/* WORK DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Work Details</Text>

          <Text style={styles.label}>स्किल / Skill *</Text>
          <View style={styles.skillContainer}>
            {SKILLS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.skillChip, selectedSkillTag === s && styles.skillChipActive]}
                onPress={() => selectSkill(s)}
              >
                <Text style={[styles.skillText, selectedSkillTag === s && styles.skillTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedSkillTag === 'Other' && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Specify Skill"
              value={skill}
              onChangeText={setSkill}
            />
          )}

          <Text style={styles.label}>अनुभव / Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="Years"
            value={experience}
            onChangeText={setExperience}
          />

          <Text style={styles.label}>दैनिक वेतन / Daily Wage</Text>
          <View style={styles.row}>
            <View style={styles.currency}><Text>₹</Text></View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              placeholder="500"
              value={wage}
              onChangeText={setWage}
            />
          </View>
        </View>

        {/* LOCATION & DOCUMENT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location & Documents</Text>

          <TouchableOpacity
            style={[
              styles.locationBox,
              locationTagged && styles.locationActive,
            ]}
            onPress={captureLocation}
          >
            <Text>📍 {locationTagged ? 'Location Tagged' : 'Tag Location'}</Text>
            <Text style={{ color: 'green' }}>{location}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Aadhaar Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Aadhaar Number"
            value={aadhaar}
            onChangeText={setAadhaar}
            maxLength={12}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => setShowAadhaarModal(true)}
          >
            <Text>⬆ Upload Aadhaar Image (Optional)</Text>
          </TouchableOpacity>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit & Onboard Worker"}</Text>
        </TouchableOpacity>

        <Text style={styles.warning}>
          Please fill required fields (Name, Phone, Skill, Photo)
        </Text>
      </ScrollView>

      {/* AADHAAR MODAL */}
      <Modal visible={showAadhaarModal} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowAadhaarModal(false)}
          >
            <Text style={{ fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          {/* RENDER EXISTING SCREEN */}
          {/* <UploadAadhaarImages /> */}
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Aadhaar</Text>

            <View style={styles.modalRow}>
              <View style={styles.half}>
                <Text style={styles.smallLabel}>Front Side</Text>
                <TouchableOpacity style={styles.aadhaarBox} onPress={() => captureAadhaarImage('front')}>
                  {aadhaarFront ? (
                    <Image source={{ uri: aadhaarFront.uri }} style={styles.aadhaarImage} />
                  ) : (
                    <Text style={styles.plus}>+</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.half}>
                <Text style={styles.smallLabel}>Back Side</Text>
                <TouchableOpacity style={styles.aadhaarBox} onPress={() => captureAadhaarImage('back')}>
                  {aadhaarBack ? (
                    <Image source={{ uri: aadhaarBack.uri }} style={styles.aadhaarImage} />
                  ) : (
                    <Text style={styles.plus}>+</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowAadhaarModal(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default OnboardNewWorker;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F2' },
  scroll: { paddingBottom: 40 },

  header: {
    backgroundColor: '#F08A34',
    padding: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerSubtitle: { color: '#FFF', opacity: 0.9 },

  card: {
    backgroundColor: '#FFF',
    margin: 14,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  required: { color: 'red', marginBottom: 10 },

  photoBox: {
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  photoText: { color: '#777' },
  photo: { width: '100%', height: '100%', borderRadius: 12 },

  label: { marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  countryCode: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 8,
  },
  currency: {
    width: 40,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 8,
  },

  locationBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  locationActive: {
    backgroundColor: '#E9FFF0',
    borderColor: 'green',
  },

  uploadBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },

  submitButton: {
    backgroundColor: '#FF9F1C',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontWeight: '600' },
  warning: { color: 'red', textAlign: 'center', marginTop: 10 },

  modalClose: {
    alignSelf: 'flex-end',
    padding: 14,
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 20,
    marginTop: 80, // push down
    elevation: 5
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  half: { width: '48%', alignItems: 'center' },
  smallLabel: { marginBottom: 8, fontWeight: '600', color: '#555' },
  aadhaarBox: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed'
  },
  aadhaarImage: { width: '100%', height: '100%', borderRadius: 10 },
  plus: { fontSize: 30, color: '#AAA' },
  closeBtn: { backgroundColor: '#FF9F1C', padding: 12, borderRadius: 10, alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontWeight: '600' },

  skillContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  skillChipActive: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9F1C'
  },
  skillText: { color: '#555' },
  skillTextActive: { color: '#FF9F1C', fontWeight: '600' },
});
