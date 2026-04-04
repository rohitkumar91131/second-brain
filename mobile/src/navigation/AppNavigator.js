import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import AuthNavigator from './AuthNavigator'
import DashboardNavigator from './DashboardNavigator'
import LoadingScreen from '../components/LoadingScreen'

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen message="Starting up..." />

  return (
    <NavigationContainer>
      {user ? <DashboardNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
