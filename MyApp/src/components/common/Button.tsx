import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'google' | 'text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    (loading || disabled) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`${variant}Text`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : '#FF9F1C'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Primary
  primary: {
    backgroundColor: '#FF9F1C',
    elevation: 6,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Secondary
  secondary: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FF9F1C',
  },
  secondaryText: {
    color: '#FF9F1C',
  },
  // Outline
  outline: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  outlineText: {
    color: '#333',
  },
  // Google
  google: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
    flexDirection: 'row',
  },
  googleText: {
    color: '#333',
    fontWeight: '500',
  },
  // Text
  text: {
    backgroundColor: 'transparent',
  },
  textText: {
    color: '#888',
    fontWeight: '500',
  },
});
