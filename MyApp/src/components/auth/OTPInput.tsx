import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  value?: string[];
  onChange?: (otp: string[]) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  value,
  onChange,
}) => {
  const [internalOtp, setInternalOtp] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<TextInput[]>([]);

  const otp = value ?? internalOtp;
  const setOtp = onChange ?? setInternalOtp;

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const joinedOtp = newOtp.join('');
    if (joinedOtp.length === length && onComplete) {
      onComplete(joinedOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { if (ref) inputs.current[index] = ref; }}
          style={styles.box}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 40,
  },
  box: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#8A8A8A',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#FFF',
  },
});
