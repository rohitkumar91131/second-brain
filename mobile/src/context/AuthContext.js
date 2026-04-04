import React, { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  const restoreSession = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('accessToken')
      const storedUser = await SecureStore.getItemAsync('user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.warn('Failed to restore session', e)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const data = await authAPI.login(email, password)
    if (!data.token) throw new Error('Login failed')
    await persistSession(data.token, data.user ?? { email })
    return data
  }

  const loginWithQR = async (token, deviceName, platform, deviceId) => {
    const data = await authAPI.verifyQR(token, deviceName, platform, deviceId)
    if (!data.accessToken) throw new Error('QR verification failed')
    await persistSession(data.accessToken, data.user)
    return data
  }

  const register = async (name, email, password) => {
    return authAPI.register(name, email, password)
  }

  const persistSession = async (accessToken, userData) => {
    setToken(accessToken)
    setUser(userData)
    await SecureStore.setItemAsync('accessToken', accessToken)
    await SecureStore.setItemAsync('user', JSON.stringify(userData))
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithQR, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
