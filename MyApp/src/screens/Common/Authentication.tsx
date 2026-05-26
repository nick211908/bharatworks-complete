import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';

import styles from '../../assets/css/Authentication';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';


const { width } = Dimensions.get('window');
export default function Authentication() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role, source, nextRoute } = route.params || {};

  const handleLogin = () => {
    navigation.replace("Login", {
      role,
      source: "Authentication",
      nextRoute: "Login",
    });
  };

  const handleRegister = () => {
    // Normalize string to handle 'Worker' or 'worker'
    const normalizedRole = (role || "").toLowerCase();

    if (normalizedRole === 'worker') {
      navigation.replace('PhoneNumberEntry', {
        role: "Worker", // Standardize to Title Case for rest of app
        source: "Authentication",
        nextRoute: 'PersonalDetailEntry',
      });
    } else if (normalizedRole === 'agent') {
      navigation.replace('PhoneNumberEntry', {
        role: "Agent", // Standardize
        source: "Authentication",
        nextRoute: "PersonalDetailEntry",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/images/bharatwork.png')}
        style={styles.logo}
      />

      {/* Brand Text */}
      <Text style={styles.brandTitle}>
        BHARAT<Text style={styles.brandHighlight}>WORK</Text>
      </Text>

      <Text style={styles.subtitle}>{t('auth.labourApp')}</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>{t('auth.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={handleRegister}>
          <Text style={styles.signupText}>{t('auth.signup')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.loginButton, { marginTop: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} 
        onPress={() => console.log("Google Login")}
      >
        <Image source={require('../../assets/images/google.png')} style={{ width: 20, height: 20, marginRight: 10 }} resizeMode="contain" />
        <Text style={[styles.loginText, { color: '#000' }]}>{t('auth.continueWithGoogle')}</Text>
      </TouchableOpacity>

    </View>
  );
}
