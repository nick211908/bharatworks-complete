import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthService } from '../../services/AuthService';
import api from '../../services/api';

export function MobileVerification() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role, phone, source, nextRoute } = route.params || {};

  useEffect(() => {
    console.log("MobileVerification MOUNTED");
    return () => console.log("MobileVerification UNMOUNTED");
  }, []);

  console.log("MobileVerification Params:", JSON.stringify(route.params));


  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-fill OTP in dev mode
  useEffect(() => {
    const devOtp = AuthService.lastDevOtp;
    if (__DEV__ && devOtp && devOtp.length === 6) {
      const otpDigits = devOtp.split("");
      setOtp(otpDigits);
      console.log("[DEV] Auto-filled OTP:", devOtp);
    }
  }, []);

  // Password setup state (shown after OTP verification during signup)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP code"
      );
      return;
    }

    setLoading(true);
    try {
      // AuthService.verifyOtp returns { user, session } or throws error
      const data = await AuthService.verifyOtp(phone, enteredOtp);

      console.log("Back from AuthService.verifyOtp. Data keys:", data ? Object.keys(data) : "null");
      // if (error) throw error; // AuthService already throws

      console.log("OTP Verified successfully for:", phone);

      if (data?.user) {
        console.log("User authenticated:", data.user.id);
        // User is authenticated - the backend already created/found the user record
        // and stored the token in AsyncStorage via AuthService.verifyOtp

        // For new signup, show password setup option
        if (source !== "Login") {
          setVerifiedUserId(data.user.id);
          console.log("Setting showPasswordSetup to true");
          setShowPasswordSetup(true);
          setLoading(false);
          return;
        }

        // Login flow - navigate directly
        navigateToNextScreen(data.user.id);
      }

    } catch (error: any) {
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Update user password via the Node.js backend
      await api.post('/auth/update-password', { password });

      Alert.alert(
        "Password Set!",
        "You can now login with phone + password next time.",
        [{ text: "OK", onPress: () => navigateToNextScreen(verifiedUserId) }]
      );
    } catch (error: any) {
      Alert.alert("Failed to Set Password", error.response?.data?.error || error.message);
      // Still allow navigation even if password setup fails
      navigateToNextScreen(verifiedUserId);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPassword = () => {
    navigateToNextScreen(verifiedUserId);
  };

  const navigateToNextScreen = (userId: string | null) => {
    console.log("NAVIGATING TO NEXT SCREEN:", { nextRoute, role, userId });

    if (nextRoute) {
      console.log("Using nextRoute:", nextRoute);
      navigation.replace(nextRoute, {
        role,
        phone,
        source,
        user_id: userId
      });
    } else {
      console.log("Using Default Logic. Role:", role);
      if (role === 'Worker') {
        navigation.replace("PersonalDetailEntry", { role, phone, user_id: userId });
      } else if (role === 'Agent') {
        navigation.replace("PersonalDetailEntry", { role, phone, user_id: userId });
      } else {
        console.log("Replacing with LabourHome");
        navigation.replace("LabourHome");
      }
    }
  };

  // Password Setup Screen
  if (showPasswordSetup) {
    console.log("Rendering Password Setup Screen");
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/bharatwork.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Set a Password</Text>

        <Text style={styles.subtitle}>
          Create a password for faster logins next time (optional)
        </Text>

        <TextInput
          style={styles.passwordInput}
          placeholder="Enter password (min 6 chars)"
          placeholderTextColor="#8A8A8A"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm password"
          placeholderTextColor="#8A8A8A"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Setting password..." : "Set Password"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipPassword}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // OTP Verification Screen
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/bharatwork.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Verification!</Text>

      <Text style={styles.subtitle}>
        Verify the code sent to +91 {phone}
      </Text>

      {/* Dev Mode Hint */}
      {__DEV__ && (
        <View style={{ backgroundColor: '#FFF3CD', borderRadius: 8, padding: 10, marginBottom: 16, width: '90%', borderWidth: 1, borderColor: '#FFEEBA' }}>
          <Text style={{ color: '#856404', fontWeight: '600', textAlign: 'center', fontSize: 13 }}>
            🔑 Dev Mode — OTP: 123456
          </Text>
        </View>
      )}

      {/* OTP Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref!)}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9EE",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2A5A",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 40,
  },

  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderColor: "#8A8A8A",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#FFF",
  },

  passwordInput: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#8A8A8A",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFF",
    marginBottom: 16,
  },

  button: {
    width: "90%",
    backgroundColor: "#FF9F1C",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  skipButton: {
    marginTop: 20,
  },

  skipButtonText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
});

export function PhoneNumberEntry() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role, source, nextRoute } = route.params || {};
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  /* Allow only numbers, max 10 digits */
  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  const handleSubmit = async () => {
    if (phone.length !== 10) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    setLoading(true);
    try {
      await AuthService.signInWithPhone(phone);
      // Navigate to OTP verification screen
      navigation.navigate("MobileVerification", {
        role,
        phone,
        source,
        nextRoute,
      });
    } catch (error: any) {
      Alert.alert("Failed to Send OTP", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles_phone_entry.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/bharatwork.png")}
        style={styles_phone_entry.logo}
      />

      <Text style={styles_phone_entry.title}>
        {source === "Login" ? "Login with OTP" : "Verify Your Phone"}
      </Text>

      <Text style={styles_phone_entry.subtitle}>
        {source === "Login"
          ? "We'll send you a one-time password"
          : "OTP required to verify your phone number"}
      </Text>

      {/* Phone Input */}
      <View style={styles_phone_entry.phoneRow}>
        <Text style={styles_phone_entry.countryCode}>+91</Text>
        <TextInput
          style={styles_phone_entry.input}
          placeholder="Enter 10-digit number"
          placeholderTextColor="#8A8A8A"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={handlePhoneChange}
          maxLength={10}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles_phone_entry.button, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles_phone_entry.buttonText}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles_phone_entry = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9EE",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2A5A",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#8A8A8A",
    borderRadius: 14,
    backgroundColor: "#FFF",
    marginBottom: 24,
    overflow: "hidden",
  },

  countryCode: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#333",
  },

  button: {
    width: "100%",
    backgroundColor: "#FF9F1C",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});