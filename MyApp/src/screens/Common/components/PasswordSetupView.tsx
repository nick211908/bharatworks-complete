import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import api from '../../../services/api';
import {
  Logo,
  Button,
  Input,
} from '../../../components/common';
import { useTranslation } from 'react-i18next';

interface PasswordSetupViewProps {
  verifiedUserId: string | null;
  onComplete: () => void;
}

export const PasswordSetupView: React.FC<PasswordSetupViewProps> = ({
  verifiedUserId,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPassword = async () => {
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.invalidPassword'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/update-password', { password });

      Alert.alert(
        t('auth.passwordSetSuccessTitle'),
        t('auth.passwordSetSuccessMessage'),
        [{ text: t('common.confirm'), onPress: onComplete }]
      );
    } catch (error: any) {
      Alert.alert(t('auth.passwordSetFailed'), error.response?.data?.error || error.message);
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Logo size="large" showText={false} />

      <Text style={styles.title}>{t('auth.setPasswordTitle')}</Text>

      <Text style={styles.subtitle}>{t('auth.setPasswordSubtitle')}</Text>

      <Input
        label={t('auth.passwordLabel')}
        placeholder={t('auth.setPasswordPlaceholder')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Input
        label={t('auth.confirmPasswordLabel')}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        title={isLoading ? t('auth.settingPassword') : t('auth.setPasswordBtn')}
        onPress={handleSetPassword}
        loading={isLoading}
        disabled={isLoading}
      />

      <Button
        title={t('auth.skipPassword')}
        onPress={handleSkip}
        variant="text"
        style={styles.skipButton}
      />
    </View>
  );
};

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
  skipButton: {
    marginTop: 20,
  },
});
