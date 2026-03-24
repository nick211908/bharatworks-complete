import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PhoneInput } from './PhoneInput';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';

interface PhoneEntryFormProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const PhoneEntryForm: React.FC<PhoneEntryFormProps> = ({
  phone,
  onPhoneChange,
  onSubmit,
  isLoading = false,
  submitButtonText,
}) => {
  return (
    <View style={styles.container}>
      <PhoneInput
        value={phone}
        onChange={onPhoneChange}
      />

      <Button
        title={isLoading ? t('sendingOtp') : (submitButtonText || t('sendOtp'))}
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading || phone.length !== 10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
  },
});
