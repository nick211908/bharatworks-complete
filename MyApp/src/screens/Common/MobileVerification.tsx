import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthService } from '../../services/AuthService';
import api from '../../services/api';
import { t } from '../../utils/i18n';

// Components
import {
  Logo,
  LanguageToggle,
  Button,
} from '../../components/common';
import {
  OTPInput,
  PhoneInput,
  DevModeHint,
} from '../../components/auth';

// Sub-components
import { PasswordSetupView } from './components/PasswordSetupView';

export function MobileVerification() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role, phone, email, source, nextRoute } = route.params || {};
  const isEmailMode = !!email;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);

  // Auto-fill OTP in dev mode
  useEffect(() => {
    const devOtp = AuthService.lastDevOtp;
    if (__DEV__ && devOtp && devOtp.length === 6) {
      const otpDigits = devOtp.split('');
      setOtp(otpDigits);
    }
  }, []);

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      Alert.alert('Invalid OTP', t('invalidOtp'));
      return;
    }

    setIsLoading(true);
    try {
      const data = isEmailMode
        ? await AuthService.verifyEmailOtp(email, enteredOtp)
        : await AuthService.verifyOtp(phone, enteredOtp);

      if (data?.user) {
        if (source !== 'Login') {
          setVerifiedUserId(data.user.id);
          setShowPasswordSetup(true);
          return;
        }

        navigateToNextScreen(data.user.id);
      }
    } catch (error: any) {
      const errorMessage = isEmailMode
        ? t('emailVerificationFailed')
        : t('phoneVerificationFailed');
      Alert.alert('Verification Failed', error?.message || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToNextScreen = (userId: string | null) => {
    if (nextRoute) {
      navigation.replace(nextRoute, {
        role,
        phone,
        source,
        user_id: userId,
      });
    } else {
      if (role === 'Worker' || role === 'Agent') {
        navigation.replace('PersonalDetailEntry', { role, phone, user_id: userId });
      } else {
        navigation.replace('LabourHome');
      }
    }
  };

  // Password setup screen
  if (showPasswordSetup) {
    return (
      <PasswordSetupView
        verifiedUserId={verifiedUserId}
        onComplete={() => navigateToNextScreen(verifiedUserId)}
      />
    );
  }

  // OTP Verification screen
  return (
    <View style={styles.container}>
      <LanguageToggle lang={lang} onToggle={setLang} />

      <Logo size="large" />

      <Text style={styles.title}>{t('verificationTitle')}</Text>

      <Text style={styles.subtitle}>
        {isEmailMode
          ? `${t('verifyEmailContent')} ${email}`
          : `${t('verifyPhoneContent')} ${phone}`}
      </Text>

      <DevModeHint />

      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
      />

      <Button
        title={t('continueBtn')}
        onPress={handleVerify}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );
}

// Phone number entry screen
export function PhoneNumberEntry() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role, source, nextRoute } = route.params || {};
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const handleSubmit = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone Number', t('invalidPhone'));
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.signInWithPhone(phone);
      navigation.navigate('MobileVerification', {
        role,
        phone,
        source,
        nextRoute,
      });
    } catch (error: any) {
      Alert.alert('Failed to Send OTP', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LanguageToggle lang={lang} onToggle={setLang} />

      <Logo size="large" />

      <Text style={styles.title}>
        {source === 'Login' ? t('loginWithPhone') : t('verifyPhone')}
      </Text>

      <Text style={styles.subtitle}>
        {source === 'Login' ? t('sendOtpDescLogin') : t('sendOtpDescVerify')}
      </Text>

      <View style={styles.form}>
        <PhoneInput
          value={phone}
          onChange={setPhone}
        />

        <Button
          title={isLoading ? t('sendingOtp') : t('sendOtp')}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9EE',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2A5A',
    marginBottom: 10,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: 16,
  },
});
