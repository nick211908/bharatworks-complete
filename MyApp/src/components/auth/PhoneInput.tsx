import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../common/Input';
import { t } from '../../utils/i18n';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label = t('phoneNumberLabel'),
  placeholder = t('phonePlaceholder'),
}) => {
  const handleChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      onChange(numericText);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label={label}
        prefix="+91"
        placeholder={placeholder}
        keyboardType="phone-pad"
        maxLength={10}
        value={value}
        onChangeText={handleChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
