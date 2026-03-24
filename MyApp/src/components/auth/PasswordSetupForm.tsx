import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';

interface PasswordSetupFormProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export const PasswordSetupForm: React.FC<PasswordSetupFormProps> = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onSkip,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('setPasswordTitle')}</Text>

      <Text style={styles.subtitle}>{t('setPasswordSubtitle')}</Text>

      <PasswordInput
        label={t('passwordLabel')}
        placeholder={t('setPasswordPlaceholder')}
        value={password}
        onChangeText={onPasswordChange}
        showPassword={false}
        onToggleVisibility={() => {}}
      />

      <PasswordInput
        label={t('confirmPasswordLabel')}
        placeholder={t('confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        showPassword={false}
        onToggleVisibility={() => {}}
      />

      <Button
        title={isLoading ? t('settingPassword') : t('setPasswordBtn')}
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
      />

      <Button
        title={t('skipPassword')}
        onPress={onSkip}
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
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
  },
  skipButton: {
    marginTop: 20,
  },
});
