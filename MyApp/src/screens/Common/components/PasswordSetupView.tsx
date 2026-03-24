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
import { t } from '../../../utils/i18n';

interface PasswordSetupViewProps {
  verifiedUserId: string | null;
  onComplete: () => void;
}

export const PasswordSetupView: React.FC<PasswordSetupViewProps> = ({
  verifiedUserId,
  onComplete,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPassword = async () => {
    if (password.length < 6) {
      Alert.alert('Invalid Password', t('invalidPassword'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', t('passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/update-password', { password });

      Alert.alert(
        'Password Set!',
        'You can now login with phone + password next time.',
        [{ text: 'OK', onPress: onComplete }]
      );
    } catch (error: any) {
      Alert.alert('Failed to Set Password', error.response?.data?.error || error.message);
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

      <Text style={styles.title}>{t('setPasswordTitle')}</Text>

      <Text style={styles.subtitle}>{t('setPasswordSubtitle')}</Text>

      <Input
        label={t('passwordLabel')}
        placeholder={t('setPasswordPlaceholder')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Input
        label={t('confirmPasswordLabel')}
        placeholder={t('confirmPasswordPlaceholder')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        title={isLoading ? t('settingPassword') : t('setPasswordBtn')}
        onPress={handleSetPassword}
        loading={isLoading}
        disabled={isLoading}
      />

      <Button
        title={t('skipPassword')}
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
