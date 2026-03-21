import 'react-native-url-polyfill/auto';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupBackgroundHandler } from './src/services/FCMService';

setupBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
