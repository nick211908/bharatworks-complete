import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { t, setLanguage } from '../../utils/i18n';

interface LanguageToggleProps {
  lang: 'en' | 'hi';
  onToggle: (lang: 'en' | 'hi') => void;
  style?: 'absolute' | 'inline';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  lang,
  onToggle,
  style = 'absolute'
}) => {
  const handleToggle = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    onToggle(nextLang);
  };

  return (
    <TouchableOpacity
      style={[styles.button, style === 'absolute' && styles.absolutePosition]}
      onPress={handleToggle}
    >
      <Text style={styles.buttonText}>{t('languageToggle')}</Text>
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
