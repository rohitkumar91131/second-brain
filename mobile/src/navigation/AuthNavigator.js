import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ConnectScreen from '../screens/auth/ConnectScreen'
import BrowserSignInScreen from '../screens/auth/BrowserSignInScreen'
import OtpConnectScreen from '../screens/auth/OtpConnectScreen'

const Stack = createNativeStackNavigator()

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Connect" component={ConnectScreen} />
      <Stack.Screen name="BrowserSignIn" component={BrowserSignInScreen} />
      <Stack.Screen name="OtpConnect" component={OtpConnectScreen} />
    </Stack.Navigator>
  )
}
