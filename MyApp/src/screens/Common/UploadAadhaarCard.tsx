import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pick, types } from "@react-native-documents/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

/* =========================
   SCREEN 1
========================= */

export function UploadAadhaarCard() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Data is now fetched from DB if needed, or we just upload.
  const { role } = route.params || {}; // Keep role for conditional logic if any

  return (
    <SafeAreaView style={styles_screen1.safeArea}>
      <View style={styles_screen1.header}>
        <Text style={styles_screen1.heading}>{t('auth.uploadAadhaarCard')}</Text>

        <TouchableOpacity
          style={styles_screen1.skipButton}
          onPress={() => navigation.navigate("UploadProfilePicture", { role })}
        >
          <Text style={styles_screen1.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles_screen1.uploadBox}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("UploadAadhaarImages", { role })}
      >
        <Text style={styles_screen1.uploadIcon}>☁️↑</Text>

        <Text style={styles_screen1.uploadText}>
          {t('auth.uploadAadhaarSubtitle')}
        </Text>
      </TouchableOpacity>

      <Text style={styles_screen1.disclaimer}>
        {t('auth.aadhaarDisclaimer')}
      </Text>

      <TouchableOpacity
        style={styles_screen1.continueButton}
        onPress={() => navigation.navigate("UploadAadhaarImages", { role })}
        activeOpacity={0.85}
      >
        <Text style={styles_screen1.continueText}>{t('common.continueBtn')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* =========================
   SCREEN 2
========================= */

export function UploadAadhaarImages({ navigation }: any) {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const pickImage = async (type: "front" | "back") => {
    try {
      const result = await pick({
        type: [types.images],
        allowMultiSelection: false,
      });

      if (result?.[0]?.uri) {
        if (type === "front") {
          setFrontImage(result[0].uri);
        } else {
          setBackImage(result[0].uri);
        }
      }
    } catch (err: any) {
      // Latest package throws error with this code on cancel
      if (err?.code !== "DOCUMENT_PICKER_CANCELED") {
        Alert.alert(t('common.error'), t('auth.failedToPickImage'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>{t('auth.uploadAadhaarCard')}</Text>

      {/* FRONT */}
      <Text style={styles.sectionTitle}>{t('auth.frontSide')}</Text>
      <Image
        source={
          frontImage
            ? { uri: frontImage }
            : require("../../assets/images/aadhaar_front_template.png")
        }
        style={styles.cardImage}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => pickImage("front")}
      >
        <Text style={styles.browseText}>{t('auth.browse')}</Text>
      </TouchableOpacity>

      {/* BACK */}
      <Text style={styles.sectionTitle}>{t('auth.backSide')}</Text>
      <Image
        source={
          backImage
            ? { uri: backImage }
            : require("../../assets/images/aadhaar_back_template.png")
        }
        style={styles.cardImage}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => pickImage("back")}
      >
        <Text style={styles.browseText}>{t('auth.browse')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !(frontImage && backImage) && { opacity: 0.6 },
        ]}
        disabled={!(frontImage && backImage)}
        onPress={() => navigation.navigate("UploadProfilePicture", { role: (route.params as any)?.role })}
      >
        <Text style={styles.continueText}>{t('common.continueBtn')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* =========================
   STYLES - SCREEN 1
========================= */

const styles_screen1 = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF6E1",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  skipButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#F08A34",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  uploadBox: {
    width: width * 0.85,
    height: 200,
    borderWidth: 1.5,
    borderColor: "#8F8F8F",
    borderStyle: "dashed",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 14,
    color: "#2E2E2E",
    textAlign: "center",
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: "#F08A34",
    paddingHorizontal: 60,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 6,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

/* =========================
   STYLES - SCREEN 2
========================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF6E1",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 20,
    color: "#1A1A1A",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginTop: 10,
    marginBottom: 6,
  },
  cardImage: {
    width: width * 0.85,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  browseButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#F08A34",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 14,
    elevation: 5,
  },
  browseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: "#F08A34",
    paddingHorizontal: 60,
    paddingVertical: 14,
    borderRadius: 18,
    elevation: 6,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
