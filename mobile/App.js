import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import { AuthProvider } from './src/context/AuthContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        })
        setFontsLoaded(true)
      } catch (e) {
        console.error('Error loading fonts:', e)
        setFontsLoaded(true) // Continue anyway
      }
    }
    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return null // Or return a splash screen
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0F172A" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
