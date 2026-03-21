import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../assets/css/Opening';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function Opening() {
  const navigation = useNavigation<any>();

  const logoTranslateY = useRef(new Animated.Value(200)).current;
  const contentTranslateY = useRef(new Animated.Value(height)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!language) return;
    navigation.replace('Onboarding');
  };

  // Check if user is already logged in - skip to home
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // User is logged in, skip to home
        navigation.replace('LabourHome');
        return;
      }

      // Not logged in, show animations
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1500);

      return () => clearTimeout(timer);
    };

    checkAuth();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Animated.Image
          source={require('../../assets/images/bharatwork.png')}
          style={[styles.logo, { transform: [{ translateY: logoTranslateY }] }]}
          resizeMode="contain"
        />

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateY: contentTranslateY }],
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>अपनी भाषा चुनें</Text>

          {/* DROPDOWN */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>
              {language ? language : 'Select Language'}
            </Text>
            <View style={styles.arrow} />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setLanguage('English');
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setLanguage('हिंदी');
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>हिंदी</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { opacity: language ? 1 : 0.5 }]}
            disabled={!language}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
