import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  Platform,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Application from 'expo-application'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function ConnectScreen({ navigation }) {
  const { loginWithQR } = useAuth()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!permission?.granted) requestPermission()
  }, [])

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return
    setScanned(true)

    // Expected format: secondbrain://connect?token=<TOKEN>&server=<URL>
    try {
      const url = new URL(data)
      if (url.protocol !== 'secondbrain:') {
        Alert.alert('Invalid QR', 'This QR code is not from Second Brain.', [
          { text: 'Scan Again', onPress: () => setScanned(false) },
        ])
        return
      }
      const token = url.searchParams.get('token')
      const server = url.searchParams.get('server')
      if (!token || !server) {
        Alert.alert('Invalid QR', 'QR code is missing required data.', [
          { text: 'Scan Again', onPress: () => setScanned(false) },
        ])
        return
      }

      // Dynamically use the server from QR for the verify call only
      const { default: api } = await import('../../services/api')
      const prevBaseURL = api.defaults.baseURL
      api.defaults.baseURL = server

      const deviceId =
        Platform.OS === 'android'
          ? Application?.androidId ?? `android-${Date.now()}`
          : Application?.applicationId ?? `ios-${Date.now()}`

      setLoading(true)
      try {
        await loginWithQR(token, 'My Phone', Platform.OS, deviceId)
        // Navigation handled by root navigator when auth state changes
      } finally {
        api.defaults.baseURL = prevBaseURL
      }
    } catch (e) {
      Alert.alert('Connection Failed', e?.response?.data?.error ?? e.message ?? 'Unknown error', [
        { text: 'Try Again', onPress: () => { setScanned(false); setLoading(false) } },
      ])
      setLoading(false)
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.permText}>Camera access is required to scan QR codes.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Open Second Brain on your computer, go to{'\n'}
          <Text style={styles.bold}>Dashboard → Connect</Text>, and scan the QR code.
        </Text>

        {/* Viewfinder */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.white} />
            <Text style={styles.loadingText}>Connecting...</Text>
          </View>
        )}

        {scanned && !loading && (
          <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}>
            <Text style={styles.btnText}>Scan Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.browserBtn} 
          onPress={() => navigation.navigate('BrowserSignIn')}
        >
          <Ionicons name="globe-outline" size={18} color={COLORS.white} />
          <Text style={styles.browserBtnText}>Sign In with Browser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.otpBtn}
          onPress={() => navigation.navigate('OtpConnect')}
        >
          <Ionicons name="keypad-outline" size={18} color={COLORS.primary} />
          <Text style={styles.otpBtnText}>Connect via 6-Digit OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const CORNER = 24
const CORNER_BORDER = 3

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xl, gap: SPACING.lg,
  },
  permText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, textAlign: 'center', maxWidth: 280 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  backBtn: {
    position: 'absolute', top: 56, left: SPACING.lg,
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  title: { color: COLORS.white, fontSize: FONT_SIZE.xl, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 20 },
  bold: { color: COLORS.white, fontWeight: '700' },
  viewfinder: {
    width: 240, height: 240,
    position: 'relative',
    marginVertical: SPACING.xl,
  },
  corner: {
    position: 'absolute', width: CORNER, height: CORNER,
    borderColor: COLORS.white,
  },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderTopLeftRadius: RADIUS.sm },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderTopRightRadius: RADIUS.sm },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderBottomLeftRadius: RADIUS.sm },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderBottomRightRadius: RADIUS.sm },
  loadingBox: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  loadingText: { color: COLORS.white, fontSize: FONT_SIZE.base },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  btnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: '700' },
  browserBtn: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  browserBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  otpBtn: {
    position: 'absolute',
    bottom: SPACING.lg + 60,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  otpBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
})
