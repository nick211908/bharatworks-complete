import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
  },

  brandTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#F18A32",
    letterSpacing: 1,
    textAlign: "center",
  },

  brandHighlight: {
    color: "#1F2A5A",
  },

  subtitle: {
    fontSize: 14,
    letterSpacing: 4,
    color: "#F18A32",
    marginTop: 6,
  },

  flexSpacer: {
    flex: 1,
  },

  /* Google Button */
  googleButton: {
    width: "90%",
    backgroundColor: "#2E3A4A",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    elevation: 6,
    marginBottom: 20,
  },

  googleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  googleIcon: {
    width: 16,
    height: 16,
    resizeMode: "center",
    marginBottom: 20,
    marginLeft: 150,
  },

  /* Divider */
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    marginVertical: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#B5B5B5",
  },

  orText: {
    marginHorizontal: 12,
    color: "#7A7A7A",
    fontWeight: "500",
  },

  /* Phone Button */
  phoneButton: {
    width: "90%",
    backgroundColor: "#3F51B5",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    elevation: 6,
    marginBottom: 40,
  },

  phoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;
