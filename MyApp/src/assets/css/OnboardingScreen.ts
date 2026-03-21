import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6E5",
    justifyContent: "space-around",
  },

  slide: {
    width,
    alignItems: "center",
    paddingTop: 80,
  },

  imageWrapper: {
    width: 260,
    height: 260,
    borderRadius: 40,
    backgroundColor: "#F18A32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },

  image: {
    width: "85%",
    height: "85%",
    resizeMode: "contain",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D1B2A",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },

  /* Bottom navigation bar */
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
  },

  skipText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F7931E",
  },

  nextButton: {
    backgroundColor: "#F7931E",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
  },

  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Register button (final slide only) */
  registerButton: {
    backgroundColor: "#F18A32",
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
    marginLeft: 30,
    marginRight: 30,
  },

  registerText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#000",
  },
});

export default styles;
