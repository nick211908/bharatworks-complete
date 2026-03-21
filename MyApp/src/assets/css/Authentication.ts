import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
  },

  brandTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F18A32",
    textAlign: "center",
    letterSpacing: 1,
  },

  brandHighlight: {
    color: "#1F2A5A",
  },

  subtitle: {
    fontSize: 14,
    letterSpacing: 3,
    color: "#F18A32",
    marginTop: 6,
    marginBottom: 40,
    textAlign: "center",
  },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },

  loginButton: {
    backgroundColor: "#F18A32",
    width: "80%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
    elevation: 6,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  signupButton: {
    backgroundColor: "#1F2A5A",
    width: "80%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },

  signupText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;
