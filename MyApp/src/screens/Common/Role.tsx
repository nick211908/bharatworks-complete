import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

import styles from "../../assets/css/Role";
const { width } = Dimensions.get("window");

export default function Role() {
  const navigation = useNavigation<any>();
  const handleWorker = () => {
    console.log("Worker selected");
    navigation.navigate("Authentication", {
      role: "Worker",
      source: "Role",
      nextRoute: "WorkerProfile",
    });
  };

  const handleAgent = () => {
    console.log("Agent selected");
    navigation.navigate("Authentication", {
      role: "Agent",
      source: "Role",
      nextRoute: "AgentProfile",
    });
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/bharatwork.png")}
        style={styles.logo}
      />

      {/* Brand Text */}
      <Text style={styles.brandTitle}>
        BHARAT<Text style={styles.brandHighlight}>WORK</Text>
      </Text>

      <Text style={styles.subtitle}>LABOUR APP</Text>

      {/* Choose Role */}
      <Text style={styles.chooseText}>Choose your Role</Text>

      {/* Worker Button */}
      <TouchableOpacity style={styles.roleButton} onPress={handleWorker}>
        <Text style={styles.roleText}>Worker</Text>
      </TouchableOpacity>

      {/* OR Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Agent Button */}
      <TouchableOpacity style={styles.roleButton} onPress={handleAgent}>
        <Text style={styles.roleText}>Agent</Text>
      </TouchableOpacity>
    </View>
  );
}
