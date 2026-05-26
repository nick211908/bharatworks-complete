import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  style?: 'absolute' | 'inline';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  style = 'absolute'
}) => {
  const { t, i18n } = useTranslation();

  const handleToggle = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <TouchableOpacity
      style={[styles.button, style === 'absolute' && styles.absolutePosition]}
      onPress={handleToggle}
    >
      <Text style={styles.buttonText}>
        {i18n.language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    backgroundColor: '#FF9F1C15',
    borderRadius: 8,
  },
  absolutePosition: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
  },
  buttonText: {
    color: '#FF9F1C',
    fontWeight: '600',
    fontSize: 12,
  },
});
