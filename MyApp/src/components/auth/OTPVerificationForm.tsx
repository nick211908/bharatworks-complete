import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OTPInput } from './OTPInput';
import { Button } from '../common/Button';
import { t } from '../../utils/i18n';

interface OTPVerificationFormProps {
  otp: string[];
  onOtpChange: (otp: string[]) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isEmailMode?: boolean;
  targetIdentifier: string;
}

export const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  otp,
  onOtpChange,
  onSubmit,
  isLoading = false,
  isEmailMode = false,
  targetIdentifier,
}) => {
  return (
    <View style={styles.container}>
      <OTPInput
        length={6}
        value={otp}
        onChange={onOtpChange}
      />

      <Button
        title={t('continueBtn')}
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});
