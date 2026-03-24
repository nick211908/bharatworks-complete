import React, { useState, useEffect } from 'react';
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
import { t } from '../../utils/i18n';

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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { role } = route.params || {};

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');



  const handlePasswordLogin = async () => {
    if (authMode === 'phone' && phone.length !== 10) {
      Alert.alert('Invalid Phone', t('invalidPhone'));
      return;
    }
    if (authMode === 'email' && (!email || !email.includes('@'))) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid Password', t('invalidPassword'));
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
        'Login Failed',
        error.response?.data?.error || error.message || 'Invalid credentials'
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
      
      // Configure right before use to avoid startup crashes
      GoogleSignin.configure({
        // webClientId: 'YOUR_WEB_CLIENT_ID'
      });

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert('Login Failed', 'Failed to retrieve Google identity token');
        return;
      }

      const response = await AuthService.signInWithGoogle(idToken, role);

      if (response.session?.access_token) {
        const homeRoute = role === 'Agent' ? 'AgentOpening' : 'LabourHome';
        navigation.replace(homeRoute);
      }
    } catch (error: any) {
      console.error('Google Login Error:', error);
      Alert.alert('Google Login Failed', error.message || 'Aborted');
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
        <LanguageToggle lang={lang} onToggle={setLang} />

        <Logo size="medium" />

        <View style={styles.form}>
          <TouchableOpacity 
            onPress={() => setAuthMode(authMode === 'phone' ? 'email' : 'phone')} 
            style={{ alignSelf: 'flex-end', marginBottom: 12 }}
          >
            <Text style={{ color: '#FF9F1C', fontWeight: '600', fontSize: 13 }}>
              {authMode === 'phone' ? 'Use Email instead' : 'Use Phone instead'}
            </Text>
          </TouchableOpacity>

          {authMode === 'phone' ? (
            <Input
              label={t('phoneNumberLabel')}
              prefix="+91"
              placeholder={t('phonePlaceholder')}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
            />
          ) : (
            <Input
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          )}

          <PasswordInput
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
          />

          <Button
            title={t('loginBtn')}
            onPress={handlePasswordLogin}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>

        <Divider />

        <Button
          title={t('loginWithPhone')}
          onPress={handleOtpLogin}
          variant="secondary"
        />

        <Button
          title={t('continueWithGoogle')}
          onPress={handleGoogleLogin}
          variant="outline"
          style={styles.googleButton}
        />

        <View style={styles.footer}>
          <Button
            title={<>
              <>
                {t('noAccount')}{' '}
                <Text style={{ color: '#FF9F1C', fontWeight: '600' }}>{t('signUp')}</Text>
              </>
            </>
            }
            onPress={() => navigation.navigate('Authentication', { role })}
            variant="text"
          />
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
  },
});
