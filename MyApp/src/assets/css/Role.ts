import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    alignItems: "center",
    paddingTop: 70,
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
    marginBottom: 30,
  },

  chooseText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    fontWeight: "500",
  },

  roleButton: {
    width: "80%",
    backgroundColor: "#F18A32",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },

  roleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    width: "80%",
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#B0B0B0",
  },

  orText: {
    marginHorizontal: 10,
    color: "#777",
    fontWeight: "500",
  },
});


export default styles;