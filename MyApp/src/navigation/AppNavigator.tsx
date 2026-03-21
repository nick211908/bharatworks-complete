import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bootstrapFcmForAuthenticatedUser } from '../services/FCMService';

/* Screens */
import Opening from '../screens/Common/Opening';
import OnboardingScreen from '../screens/Common/OnboardingScreen';

import Authentication from '../screens/Common/Authentication'; // adjust if name differs
import Role from '../screens/Common/Role';
import Login from '../screens/Common/Login';
import { PhoneNumberEntry } from '../screens/Common/MobileVerification';
import { MobileVerification } from '../screens/Common/MobileVerification';
import PersonalDetailEntry from '../screens/Common/PersonalDetailEntry';

import { UploadAadhaarCard } from '../screens/Common/UploadAadhaarCard';
import { UploadAadhaarImages } from '../screens/Common/UploadAadhaarCard';
import { UploadProfilePicture } from '../screens/Common/UploadProfilePicture';
import AgentOpening from '../screens/Agent/AgentOpening';
import AgentRegistration from '../screens/Agent/AgentRegistration';
import AgentProfile from '../screens/Agent/Profile';
import BulkOnboarding from '../screens/Agent/BulkOnboarding';
import IncentiveTracking from '../screens/Agent/IncentiveTracking';
import OnboardNewWorker from '../screens/Agent/OnboardNewWorker';
import ViewWorkers from '../screens/Agent/ViewWorkers';
import LabourHome from '../screens/Labour/portfolioLabour';
import LabourAllJobs from '../screens/Labour/jobScreen';
import LabourJobNotification from '../screens/Labour/jobNotification';
import LabourEarnings from '../screens/Labour/earningScreen';
import LabourProfile from '../screens/Labour/profileScreen';
import LabourJobApply from '../screens/Labour/JobApply';


export type RootStackParamList = {
  Opening: undefined;
  Onboarding: undefined;
  Role: undefined;

  PhoneNumberEntry: undefined;
  MobileVerification: undefined;
  Authentication: undefined;
  Login: undefined;
  AgentAuthentication: undefined;
  AgentLogin: undefined;
  PersonalDetailEntry: undefined;
  AgentPersonalDetailEntry: undefined;
  LabourJobApply: undefined;
  LabourHome: undefined;
  LabourAllJobs: undefined;
  LabourJobNotification: undefined;
  LabourEarnings: undefined;
  LabourProfile: undefined;

  UploadAadhaarCard: undefined;
  UploadAadhaarImages: undefined;
  UploadProfilePicture: undefined;
  AgentOpening: undefined;
  AgentProfile: undefined;
  BulkOnboarding: undefined;
  IncentiveTracking: undefined;
  OnboardNewWorker: undefined;
  ViewWorkers: undefined;
  AgentRegistration: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = bootstrapFcmForAuthenticatedUser();
    return unsubscribe;
  }, [isLoggedIn]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F08A33" />
      </View>
    );
  }

  // Determine initial route based on token
  const initialRoute = isLoggedIn ? 'LabourHome' : 'Opening';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Opening" component={Opening} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Role" component={Role} />

          <Stack.Screen name="PhoneNumberEntry" component={PhoneNumberEntry} />
          <Stack.Screen name="MobileVerification" component={MobileVerification} />
          <Stack.Screen name="Authentication" component={Authentication} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="PersonalDetailEntry" component={PersonalDetailEntry} />

          <Stack.Screen name="UploadAadhaarCard" component={UploadAadhaarCard} />
          <Stack.Screen name="UploadAadhaarImages" component={UploadAadhaarImages} />
          <Stack.Screen name="UploadProfilePicture" component={UploadProfilePicture} />
          <Stack.Screen name="LabourHome" component={LabourHome} />
          <Stack.Screen name="LabourAllJobs" component={LabourAllJobs} />
          <Stack.Screen name="LabourJobNotification" component={LabourJobNotification} />
          <Stack.Screen name="LabourEarnings" component={LabourEarnings} />
          <Stack.Screen name="LabourProfile" component={LabourProfile} />
          <Stack.Screen name="LabourJobApply" component={LabourJobApply} />
          <Stack.Screen name="AgentOpening" component={AgentOpening} />
          <Stack.Screen name="AgentRegistration" component={AgentRegistration} />
          <Stack.Screen name="AgentProfile" component={AgentProfile} />
          <Stack.Screen name="BulkOnboarding" component={BulkOnboarding} />
          <Stack.Screen name="IncentiveTracking" component={IncentiveTracking} />
          <Stack.Screen name="OnboardNewWorker" component={OnboardNewWorker} />
          <Stack.Screen name="ViewWorkers" component={ViewWorkers} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9EE',
  },
});
