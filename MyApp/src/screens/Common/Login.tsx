import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthService } from "../../services/AuthService";

export default function Login() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role } = route.params || {};

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  const handlePasswordLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { session, user } = await AuthService.signInWithPassword(phone, password);

      if (session && user) {
        // Navigate to home - user already exists in backend after signInWithPassword
        const homeRoute = role === 'Agent' ? 'AgentOpening' : 'LabourHome';
        navigation.replace(homeRoute);
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.error || error.message || "Invalid phone or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = () => {
    const loginNextRoute = role === 'Agent' ? 'AgentOpening' : 'LabourHome';
    navigation.navigate("PhoneNumberEntry", {
      role,
      source: "Login",
      nextRoute: loginNextRoute,
    });
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
    Alert.alert("Coming Soon", "Google login will be available soon");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image
          source={require("../../assets/images/bharatwork.png")}
          style={styles.logo}
        />

        {/* Brand Title */}
        <Text style={styles.brandTitle}>
          BHARAT<Text style={styles.brandHighlight}>WORK</Text>
        </Text>

        <Text style={styles.subtitle}>LABOUR APP</Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.phoneInputRow}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handlePasswordLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* OTP Login Option */}
        <TouchableOpacity
          style={styles.otpButton}
          onPress={handleOtpLogin}
        >
          <Text style={styles.otpButtonText}>Login with OTP</Text>
        </TouchableOpacity>

        {/* Google Button */}
        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.8}
          onPress={handleGoogleLogin}
        >
          <Image
            source={require("../../assets/images/google.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate("Authentication", { role })}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9EE",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FF9F1C",
  },
  brandHighlight: {
    color: "#1F2A5A",
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 4,
    color: "#FF9F1C",
    marginTop: 4,
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#333",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
    paddingVertical: 14,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  passwordInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  eyeText: {
    color: "#FF9F1C",
    fontWeight: "600",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#FF9F1C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  orText: {
    marginHorizontal: 12,
    color: "#888",
    fontWeight: "500",
  },
  otpButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FF9F1C",
    alignItems: "center",
    marginBottom: 12,
  },
  otpButtonText: {
    color: "#FF9F1C",
    fontSize: 15,
    fontWeight: "600",
  },
  googleButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
  },
  signupLink: {
    marginTop: 24,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupHighlight: {
    color: "#FF9F1C",
    fontWeight: "600",
  },
});

