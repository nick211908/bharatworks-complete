import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';


const { width } = Dimensions.get('window');

export function UploadProfilePicture() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();

  const [imageUri, setImageUri] = useState<string | null>(null);

  const takePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.8,
    });

    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    } else {
      Alert.alert(t('common.error'), t('auth.unableToCapture'));
    }
  };

  const pickFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    } else {
      Alert.alert(t('common.error'), t('auth.unableToSelect'));
    }
  };

  /* Save Logic */
  const saveProfile = async (skipImage = false) => {
    try {
      if (!skipImage && imageUri) {
        // Update profile picture via backend
        await api.patch('/users/profile', { photoUrl: imageUri });
      }

      // Navigate
      navigation.replace('LabourProfile');

    } catch (error: any) {
      Alert.alert(t('auth.errorSavingProfile'), error.response?.data?.error || error.message);
    }
  };

  const handleSave = () => {
    if (!imageUri) {
      Alert.alert(t('auth.noImageSelected'));
      return;
    }
    saveProfile(false);
  };

  const handleContinue = () => {
    // Allow skipping image but still save text data
    saveProfile(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TITLE */}
      <Text style={styles.heading}>{t('auth.uploadPicture')}</Text>

      {/* PROFILE IMAGE */}
      <View style={styles.avatarWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        )}
      </View>

      {/* SAVE BUTTON (ONLY AFTER IMAGE PICKED) */}
      {imageUri && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>{t('common.save')}</Text>
        </TouchableOpacity>
      )}

      {/* CONTINUE BUTTON (ALWAYS AVAILABLE) */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>{t('common.continueBtn')}</Text>
      </TouchableOpacity>

      {/* ACTION BUTTONS */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={takePhoto}
        >
          <Text style={styles.actionText}>{t('auth.takePhoto')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={pickFromGallery}
        >
          <Text style={styles.actionText}>{t('auth.uploadFromGallery')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF6E1',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C2A5A',
    marginTop: 30,
    marginBottom: 40,
  },

  avatarWrapper: {
    marginBottom: 20,
  },

  avatarPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF9A4D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarIcon: {
    fontSize: 70,
  },

  avatarImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },

  saveButton: {
    backgroundColor: '#F08A34',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 18,
    elevation: 6,
    marginBottom: 80,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  continueButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#F08A34',
    paddingVertical: 14,
    paddingHorizontal: 70,
    borderRadius: 18,
    elevation: 6,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  actionContainer: {
    position: 'absolute',
    bottom: 140,
    width: '100%',
    alignItems: 'center',
  },

  actionButton: {
    width: width * 0.75,
    backgroundColor: '#F08A34',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    marginBottom: 14,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
