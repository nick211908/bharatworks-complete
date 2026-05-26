import React, { useEffect, useState, useCallback } from 'react'
import './i18n';
import { View, Text, DeviceEventEmitter } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'

import HomeScreen from './screens/homescreen'
import SearchHelperScreen from './screens/searchWorker'
import QuickJobPostScreen from './screens/quickJobPost'
import ProfileWalletScreen from './screens/profileWallet'
import MarkAttendance from './screens/MarkAttendance'
import CustomTabBar from './components/CustomTabBar'

import LanguageSelectionScreen from './screens/LanguageSelection'
import AuthScreen from './screens/AuthScreen'
import EmployerRegistrationScreen from './screens/EmployerRegistration'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="SearchHelper" component={SearchHelperScreen} />
      <Tab.Screen name="QuickJobPost" component={QuickJobPostScreen} />
      <Tab.Screen name="MarkAttendance" component={MarkAttendance} />
      <Tab.Screen name="ProfileWallet" component={ProfileWalletScreen} />
    </Tab.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Language" component={LanguageSelectionScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="EmployerRegistration" component={EmployerRegistrationScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'needs_profile' | 'authenticated'>('loading')

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken')
      const profileComplete = await AsyncStorage.getItem('employerProfileComplete')

      if (!token) {
        setAuthState('unauthenticated')
      } else if (profileComplete === 'true') {
        setAuthState('authenticated')
      } else {
        setAuthState('needs_profile')
      }
    } catch {
      setAuthState('unauthenticated')
    }
  }, [])

  useEffect(() => {
    checkAuth()

    // Listen for auth events from AuthScreen / EmployerRegistration
    const loginSub = DeviceEventEmitter.addListener('AUTH_LOGIN', checkAuth)
    const profileSub = DeviceEventEmitter.addListener('AUTH_PROFILE_COMPLETE', checkAuth)
    const logoutSub = DeviceEventEmitter.addListener('AUTH_LOGOUT', checkAuth)

    return () => {
      loginSub.remove()
      profileSub.remove()
      logoutSub.remove()
    }
  }, [checkAuth])

  if (authState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>BharatWorks...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      {authState === 'unauthenticated' ? (
        <AuthStack />
      ) : authState === 'needs_profile' ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="EmployerRegistration" component={EmployerRegistrationScreen} />
        </Stack.Navigator>
      ) : (
        <MainTabs />
      )}
    </NavigationContainer>
  )
}
