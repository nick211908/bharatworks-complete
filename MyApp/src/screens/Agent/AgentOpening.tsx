import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { WorkerService } from '../../services/WorkerService';

export default function AgentOpening() {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role, name, gender, dob, occupation, address, aadhaarCardNo } = route.params || {};

  // Handle hardware back button - go to LabourHome instead of stack history
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.replace('LabourHome');
      return true; // Prevent default back behavior
    });
    return () => backHandler.remove();
  }, [navigation]);

  const handleBack = () => {
    navigation.replace('LabourHome');
  };

  const handleStartAdding = () => {
    navigation.navigate("AgentProfile", {
      role,
      name,
      gender,
      dob,
      occupation,
      address,
      aadhaarCardNo,
    });
  };

  const [stats, setStats] = React.useState({ name: '', workersAdded: 0 });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const data = await WorkerService.getAgentStats();
      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Feather name="arrow-left" size={24} color="#1F2A5A" />
      </TouchableOpacity>

      {/* Brand */}
      <Text style={styles.brand}>
        Bharat<Text style={styles.brandHighlight}>Work</Text>
      </Text>
      <Text style={styles.agentText}>AGENT</Text>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          Great! You are now a{" "}
          <Text style={styles.highlight}>BharatWork</Text> Agent.
        </Text>


        <Text style={styles.subMessage}>
          You have added <Text style={{ fontWeight: 'bold' }}>{stats.workersAdded}</Text> workers so far.
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleStartAdding}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Start Adding</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7E6",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
  },

  /* Brand */
  brand: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF9F1C",
  },

  brandHighlight: {
    color: "#1F2A5A",
  },

  agentText: {
    fontSize: 14,
    letterSpacing: 6,
    color: "#FF9F1C",
    marginTop: 6,
  },

  /* Message */
  messageContainer: {
    marginTop: 80,
    alignItems: "center",
  },

  message: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    lineHeight: 28,
  },

  highlight: {
    color: "#FF9F1C",
    fontWeight: "700",
  },

  subMessage: {
    fontSize: 16,
    marginTop: 14,
    color: "#000",
  },

  /* Button */
  button: {
    backgroundColor: "#FF9F1C",
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 16,
    marginTop: 40,
    elevation: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
