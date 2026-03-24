import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  prefix?: string;
  error?: string;
  containerStyle?: object;
}

export const Input: React.FC<InputProps> = ({
  label,
  prefix,
  error,
  containerStyle,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.errorBorder]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix, style]}
          placeholderTextColor="#999"
          {...textInputProps}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface PasswordInputProps extends InputProps {
  showPassword: boolean;
  onToggleVisibility: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showPassword,
  onToggleVisibility,
  label,
  error,
  containerStyle,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.errorBorder]}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          secureTextEntry={!showPassword}
          placeholderTextColor="#999"
          {...textInputProps}
        />
        <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeButton}>
          <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  errorBorder: {
    borderColor: '#FF4444',
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#DDD',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  inputWithPrefix: {
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 0,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  eyeText: {
    color: '#FF9F1C',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
