module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Add this plugin section:
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }]
  ]
};