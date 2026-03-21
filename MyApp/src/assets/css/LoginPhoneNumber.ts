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

  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFA45B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  image: {
    width: "85%",
    height: "85%",
    resizeMode: "contain",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    elevation: 2,
  },

  button: {
    width: "100%",
    backgroundColor: "#F18A32",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default styles;