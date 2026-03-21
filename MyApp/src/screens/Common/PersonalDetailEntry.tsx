import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

export default function PersonalDetailEntry() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role } = route.params || {};

  // ✅ Derived variable instead of state
  const isWorker = role === "Worker";

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [aadhaarCardNo, setAadhaarCardNo] = useState("");
  const [occupation, setOccupation] = useState<
    "Govt Employed" | "Private Sector" | "Other" | ""
  >("");

  /* Save & Next */

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const detectLocation = async () => {
    setLocationStatus('loading');
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Location permission is required.");
          setLocationStatus('error');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setLocationStatus('success');
        },
        (error) => {
          console.error(error.code, error.message);
          setLocationStatus('error');
          Alert.alert("Location Error", "Could not fetch location.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

    } catch (err) {
      console.warn(err);
      setLocationStatus('error');
    }
  };

  /* Save & Next */
  const saveDataAndNavigate = async (targetScreen: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error("No authenticated user found. Please log in again.");

      // 1. Update public.users (Name) via backend
      if (name) {
        await api.patch('/users/profile', { name });
      }

      // 2. Upsert Worker/Agent Details
      if (isWorker) {
        const workerData = {
          documents: {
            gender,
            dob: dob?.toISOString(),
            pincode,
            skill: occupation || "Unskilled",
            address
          },
          latitude: location?.lat,
          longitude: location?.lng,
        };

        await api.post('/users/worker', workerData);
        navigation.navigate(targetScreen, { role: "Worker" });
      } else {
        navigation.navigate(targetScreen, {
          role: "Agent",
          name,
          gender,
          dob: dob?.toISOString(),
          address,
          aadhaarCardNo,
        });
      }

    } catch (error: any) {
      Alert.alert("Error saving details", error.response?.data?.error || error.message);
    }
  };

  const handleSkip = () => {
    saveDataAndNavigate(isWorker ? "UploadAadhaarCard" : "AgentRegistration");
  };

  const handleNext = () => {
    saveDataAndNavigate(isWorker ? "UploadAadhaarCard" : "AgentRegistration");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register Yourself!</Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.dropdown}>
        <TouchableOpacity onPress={() => setGender("Male")}>
          <Text style={styles.dropdownText}>{gender || "Select"}</Text>
        </TouchableOpacity>
      </View>

      {gender === "" && (
        <View style={styles.genderOptions}>
          <TouchableOpacity onPress={() => setGender("Male")}>
            <Text style={styles.optionText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender("Female")}>
            <Text style={styles.optionText}>Female</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date of Birth */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dropdownText}>
          {dob ? dob.toLocaleDateString() : "DD/MM/YYYY"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Worker or Agent Conditional Fields */}
      {isWorker ? (
        <>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Pincode"
            keyboardType="number-pad"
            maxLength={6}
            value={pincode}
            onChangeText={setPincode}
          />

          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={[styles.locationButton, locationStatus === 'success' && styles.locationSuccess]}
            onPress={detectLocation}
          >
            <Text style={styles.locationButtonText}>
              {locationStatus === 'loading' ? 'Detecting...' :
                locationStatus === 'success' ? '📍 Location Detected' :
                  '📍 Detect Current Location'}
            </Text>
          </TouchableOpacity>
          {locationStatus === 'error' && (
            <Text style={styles.errorText}>Could not detect location. Please try again.</Text>
          )}

          <Text style={styles.label}>Aadhaar Card No.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Aadhaar Card No."
            value={aadhaarCardNo}
            onChangeText={setAadhaarCardNo}
            keyboardType="numeric"
            maxLength={12}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Occupation</Text>
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={() => setOccupation("Govt Employed")}>
              <Text style={styles.dropdownText}>
                {occupation || "Select"}
              </Text>
            </TouchableOpacity>
          </View>

          {occupation === "" && (
            <View style={styles.genderOptions}>
              <TouchableOpacity onPress={() => setOccupation("Govt Employed")}>
                <Text style={styles.optionText}>Govt Employed</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOccupation("Private Sector")}>
                <Text style={styles.optionText}>Private Sector</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOccupation("Other")}>
                <Text style={styles.optionText}>Other</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Address"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Aadhaar Card No.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Aadhaar Card No."
            value={aadhaarCardNo}
            onChangeText={setAadhaarCardNo}
          />
        </>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2A5A",
    textAlign: "center",
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  skipText: {
    backgroundColor: "#FF9F1C",
    color: "#FFF",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#8A8A8A",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFF7E6",
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: "#8A8A8A",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFF7E6",
  },
  dropdownText: {
    fontSize: 16,
    color: "#555",
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  optionText: {
    fontSize: 16,
    paddingVertical: 6,
  },
  nextButton: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 40,
    elevation: 6,
  },
  nextText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  locationButton: {
    backgroundColor: '#FFE8D6',
    borderWidth: 1,
    borderColor: '#FF9F1C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  locationSuccess: {
    backgroundColor: '#E6F8ED',
    borderColor: '#9BE3B3',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 4,
  }
});
