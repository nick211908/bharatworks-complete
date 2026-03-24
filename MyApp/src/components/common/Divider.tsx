import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { t } from '../../utils/i18n';

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = t('or') }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  text: {
    marginHorizontal: 12,
    color: '#888',
    fontWeight: '500',
  },
});
