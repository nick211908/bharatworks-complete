import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9EE",
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

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2A5A",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 50,
  },

  otpBox: {
    width: 55,
    height: 55,
    borderWidth: 1.5,
    borderColor: "#8A8A8A",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
  },

  button: {
    width: "90%",
    backgroundColor: "#F18A32",
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
});

export default styles;
