import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { t } from '../../utils/i18n';

interface DevModeHintProps {
  otp?: string;
}

export const DevModeHint: React.FC<DevModeHintProps> = ({ otp = '123456' }) => {
  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🔑 Dev Mode — OTP: {otp}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: '90%',
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  text: {
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
});
