import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthService } from '../../services/AuthService';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role, phone, email, source, nextRoute } = route.params || {};
  const isEmailMode = !!email;

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
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
      Alert.alert(t('common.error'), t('auth.invalidOtp'));
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
        ? t('auth.emailVerificationFailed')
        : t('auth.phoneVerificationFailed');
      Alert.alert(t('common.failed'), error?.message || errorMessage);
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
      <LanguageToggle />

      <Logo size="large" />

      <Text style={styles.title}>{t('auth.verificationTitle')}</Text>

      <Text style={styles.subtitle}>
        {isEmailMode
          ? `${t('auth.verifyEmailContent')} ${email}`
          : `${t('auth.verifyPhoneContent')} ${phone}`}
      </Text>

      <DevModeHint />

      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
      />

      <Button
        title={t('auth.continueBtn')}
        onPress={handleVerify}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );
}

// Phone number entry screen
export function PhoneNumberEntry() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { role, source, nextRoute } = route.params || {};
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone.length !== 10) {
      Alert.alert(t('common.error'), t('auth.invalidPhone'));
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
      Alert.alert(t('common.failed'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LanguageToggle />

      <Logo size="large" />

      <Text style={styles.title}>
        {source === 'Login' ? t('auth.loginWithPhone') : t('auth.verifyPhone')}
      </Text>

      <Text style={styles.subtitle}>
        {source === 'Login' ? t('auth.sendOtpDescLogin') : t('auth.sendOtpDescVerify')}
      </Text>

      <View style={styles.form}>
        <PhoneInput
          value={phone}
          onChange={setPhone}
        />

        <Button
          title={isLoading ? t('auth.sendingOtp') : t('auth.sendOtp')}
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
