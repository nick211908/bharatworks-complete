import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthService } from '../../services/AuthService';
import { useTranslation } from 'react-i18next';

// Components
import {
  Logo,
  LanguageToggle,
  Button,
  Input,
  PasswordInput,
  Divider,
} from '../../components/common';

export default function Login() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role } = route.params || {};

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordLogin = async () => {
    if (authMode === 'phone' && phone.length !== 10) {
      Alert.alert(t('common.error'), t('auth.invalidPhone'));
      return;
    }
    if (authMode === 'email' && (!email || !email.includes('@'))) {
      Alert.alert(t('common.error'), t('auth.emailPlaceholder'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.invalidPassword'));
      return;
    }

    setIsLoading(true);
    try {
      const response = authMode === 'phone'
        ? await AuthService.signInWithPassword(phone, password)
        : await AuthService.signInWithEmail(email, password);

      const { session, user } = response;

      if (session && user) {
        const homeRoute = role === 'Agent' ? 'AgentOpening' : 'LabourHome';
        navigation.replace(homeRoute);
      }
    } catch (error: any) {
      Alert.alert(
        t('common.failed'),
        error.response?.data?.error || error.message || t('common.error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = () => {
    const loginNextRoute = role === 'Agent' ? 'AgentOpening' : 'LabourHome';
    navigation.navigate('PhoneNumberEntry', {
      role,
      source: 'Login',
      nextRoute: loginNextRoute,
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      
      GoogleSignin.configure({});

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert(t('common.failed'), t('common.error'));
        return;
      }

      const response = await AuthService.signInWithGoogle(idToken, role);

      if (response.session?.access_token) {
        const homeRoute = role === 'Agent' ? 'AgentOpening' : 'LabourHome';
        navigation.replace(homeRoute);
      }
    } catch (error: any) {
      console.error('Google Login Error:', error);
      Alert.alert(t('common.failed'), error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setPhone(numericText);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LanguageToggle />

        <Logo size="medium" />

        <View style={styles.form}>
          <TouchableOpacity 
            onPress={() => setAuthMode(authMode === 'phone' ? 'email' : 'phone')} 
            style={{ alignSelf: 'flex-end', marginBottom: 12 }}
          >
            <Text style={{ color: '#FF9F1C', fontWeight: '600', fontSize: 13 }}>
              {authMode === 'phone' ? t('auth.useEmail') : t('auth.usePhone')}
            </Text>
          </TouchableOpacity>

          {authMode === 'phone' ? (
            <Input
              label={t('auth.phoneNumberLabel')}
              prefix="+91"
              placeholder={t('auth.phonePlaceholder')}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
            />
          ) : (
            <Input
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          )}

          <PasswordInput
            label={t('auth.passwordLabel')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
          />

          <Button
            title={t('auth.loginBtn')}
            onPress={handlePasswordLogin}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

        <Divider />

        <Button
          title={t('auth.loginWithPhone')}
          onPress={handleOtpLogin}
          variant="secondary"
        />

        <Button
          title={t('auth.continueWithGoogle')}
          onPress={handleGoogleLogin}
          variant="outline"
          style={styles.googleButton}
        />

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Authentication', { role })}>
             <Text style={styles.footerText}>
                {t('auth.noAccount')}{' '}
                <Text style={{ color: '#FF9F1C', fontWeight: '600' }}>{t('auth.signUp')}</Text>
             </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9EE',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  form: {
    width: '100%',
    marginTop: 30,
  },
  googleButton: {
    marginTop: 12,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  }
});
