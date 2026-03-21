import { Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F5', // Using COLORS.background
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
    paddingHorizontal: 24,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginTop: 60,
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1C1C1C', // COLORS.textPrimary
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: '#6C757D', // COLORS.textSecondary
    textAlign: 'center',
  },
  dropdown: {
    width: '100%',
    height: 56, // Material Design min touch target
    borderWidth: 1,
    borderColor: '#D1D5DB', // COLORS.inputBorder
    borderRadius: 8, // Material Design rounded corners
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // COLORS.card
    elevation: 2, // Material elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#6C757D', // COLORS.textSecondary
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF8C69', // COLORS.primary
  },
  button: {
    marginTop: 40,
    backgroundColor: '#FF8C69', // COLORS.primary
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 4, // Higher elevation for button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // COLORS.textWhite
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    width: '100%',
    backgroundColor: '#FFFFFF', // COLORS.card
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB', // COLORS.inputBorder
    marginTop: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // COLORS.borderLight
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#1C1C1C', // COLORS.textPrimary
  },
});

export default styles;
