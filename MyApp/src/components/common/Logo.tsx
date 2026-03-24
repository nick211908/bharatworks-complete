import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const sizes = {
  small: { width: 80, height: 80 },
  medium: { width: 120, height: 120 },
  large: { width: 140, height: 140 },
};

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const dimensions = sizes[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/bharatwork.png')}
        style={[styles.logo, dimensions]}
      />
      {showText && (
        <>
          <Text style={styles.brandTitle}>
            BHARAT<Text style={styles.brandHighlight}>WORK</Text>
          </Text>
          <Text style={styles.subtitle}>LABOUR APP</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    resizeMode: 'contain',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF9F1C',
  },
  brandHighlight: {
    color: '#1F2A5A',
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 4,
    color: '#FF9F1C',
    marginTop: 4,
  },
});
