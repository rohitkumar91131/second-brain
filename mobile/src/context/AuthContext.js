import React, { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
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



  const loginWithQR = async (token, deviceName, platform, deviceId) => {
    const data = await authAPI.verifyQR(token, deviceName, platform, deviceId)
    if (!data.accessToken) throw new Error('QR verification failed')
    await persistSession(data.accessToken, data.user)
    return data
  }

  const loginWithOTP = async (email, otp, deviceName, platform, deviceId) => {
    const data = await authAPI.verifyOTP(email, otp, deviceName, platform, deviceId)
    if (!data.accessToken) throw new Error('OTP verification failed')
    await persistSession(data.accessToken, data.user)
    return data
  }

  const loginWithBrowser = async (deviceName, platform, deviceId, fcmToken) => {
    // Initiate verification request
    const initiateRes = await authAPI.initiateDeviceVerification({
      deviceName,
      platform,
      deviceId,
      fcmToken,
    })

    const { requestId, verificationUrl, expiresIn } = initiateRes

    // Open browser with verification URL
    await WebBrowser.openBrowserAsync(verificationUrl)

    // Poll for approval (every 1 second, timeout after 5 minutes)
    let pollCount = 0
    const maxPolls = expiresIn // 300 polls for 5 minutes
    const pollInterval = 1000 // 1 second

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        pollCount++

        if (pollCount > maxPolls) {
          clearInterval(interval)
          reject(new Error('Device verification request expired'))
          return
        }

        try {
          const statusRes = await authAPI.checkDeviceVerificationStatus(requestId)

          if (statusRes.status === 'approved' && statusRes.accessToken) {
            clearInterval(interval)
            await persistSession(statusRes.accessToken, statusRes.user)
            resolve(statusRes)
          } else if (statusRes.status === 'expired' || statusRes.status === 'rejected') {
            clearInterval(interval)
            reject(new Error(`Device verification ${statusRes.status}`))
          }
        } catch (err) {
          console.warn('Error checking verification status:', err)
          // Continue polling even if there's an error
        }
      }, pollInterval)
    })
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
    <AuthContext.Provider value={{ user, token, loading, loginWithQR, loginWithOTP, loginWithBrowser, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
