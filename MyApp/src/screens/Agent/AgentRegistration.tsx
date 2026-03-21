import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WorkerService } from "../../services/WorkerService";

export default function AgentRegistration() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    // params passed from PersonalDetailEntry might include name, gender, dob, aadhaar etc.
    const { name, gender, dob, address, aadhaarCardNo } = route.params || {};

    const [agencyName, setAgencyName] = useState("");
    const [region, setRegion] = useState("");
    const [experience, setExperience] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!agencyName || !region) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // 1. Register Agent in Backend
            // We assume user is already authenticated from previous steps
            // But we need to make sure the user record is created or updated in public.users first if not already done.
            // PersonalDetailEntry already handled public.users update.

            const agentData = {
                agency_name: agencyName,
                region: region,
                experience_years: experience,
                // We can also store personal details if the agents table schema requires duplicate storage
                // or just link via user_id
            };

            await WorkerService.registerAgent(agentData);

            // 2. Navigate to Success / AgentOpening
            navigation.replace("AgentOpening", {
                name,
                role: "Agent"
            });

        } catch (error: any) {
            console.error(error);
            Alert.alert("Registration Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Agent Profile</Text>
            <Text style={styles.subHeading}>Just a few more details</Text>

            <Text style={styles.label}>Agency Name (Optional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Agency Name"
                value={agencyName}
                onChangeText={setAgencyName}
            />

            <Text style={styles.label}>Operating Region / City *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Gurugram, Delhi NCR"
                value={region}
                onChangeText={setRegion}
            />

            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. 5"
                keyboardType="numeric"
                value={experience}
                onChangeText={setExperience}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? "Registering..." : "Complete Registration"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#FFF7E6",
        padding: 24,
        paddingTop: 50,
    },
    heading: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2A5A",
        marginBottom: 8,
    },
    subHeading: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 16,
        marginBottom: 8,
        color: "#333",
    },
    input: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#FF9F1C",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 40,
        elevation: 4,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
    },
});
