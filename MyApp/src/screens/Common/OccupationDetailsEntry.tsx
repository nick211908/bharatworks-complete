import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from '@react-navigation/native';


export default function LabourOccupationDetailEntry() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role, name, gender, dob, pincode, city, state } = route.params || {};
  const [occupation, setOccupation] = useState<"Labour" | "Mistri" | "Other" | "">("");
  const [lastworked, setLastWorked] = useState("");
  const [experience, setExperience] = useState("");
  const handleSkip = () => {
    navigation.replace("UploadAadhaarCard", {
      role,
      name,
      gender,
      dob,
      pincode,
      city,
      state,
      occupation,
      lastworked,
      experience,
    });
  };

  const handleNext = () => {
    console.log({ occupation, lastworked, experience }),
    navigation.navigate("UploadAadhaarCard", {
      role: "Worker",
      name,
      gender,
      dob,
      pincode,
      city,
      state,
      occupation,
      lastworked,
      experience,
    });
};

  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>Register Yourself!</Text>

      {/* Personal Details Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Occupation Details</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Gender */}
      <Text style={styles.label}>Occupation</Text>
          <View style={styles.dropdown}>
        <TouchableOpacity onPress={() => setOccupation("Labour")}>
          <Text style={styles.dropdownText}>
            {occupation || "Select"}
          </Text>
        </TouchableOpacity>
      </View>

      {occupation === "" && (
        <View style={styles.genderOptions}>
          <TouchableOpacity onPress={() => setOccupation("Labour")}>
            <Text style={styles.optionText}>Labour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOccupation("Mistri")}>
            <Text style={styles.optionText}>Mistri</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOccupation("Other")}>
            <Text style={styles.optionText}>Other</Text>
          </TouchableOpacity>
        </View>
        )}

    {/* Last Worked */}
    <Text style={styles.label}>Last Work You Do</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your last work"
            placeholderTextColor="#777"
            value={lastworked}
            onChangeText={setLastWorked}
          />
    {/* Experience */}
    <Text style={styles.label}>Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your experience"
            placeholderTextColor="#777"
            value={experience}
            onChangeText={setExperience}
          />


      {/* Next Button */}
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
});
