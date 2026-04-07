import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import * as Device from 'expo-device'
import * as Application from 'expo-application'
import * as Crypto from 'expo-crypto'
import { useAuth } from '../../context/AuthContext'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function BrowserSignInScreen({ navigation }) {
  const { loginWithBrowser } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleBrowserSignIn = async () => {
    setLoading(true)
    try {
      // Get device info
      const platform = Platform.OS === 'ios' ? 'ios' : 'android'
      const deviceName = Device.deviceName || `${Platform.OS} Device`
      const deviceId = Application.androidId || (await SecureStore.getItemAsync('deviceId')) || Crypto.randomUUID()

      // Store device ID for future reference
      await SecureStore.setItemAsync('deviceId', deviceId)

      // Initiate browser sign-in
      await loginWithBrowser(deviceName, platform, deviceId, null)

      // If successful, user will be navigated automatically by AuthContext
      Alert.alert('Success', 'Device approved! Welcome back.')
    } catch (error) {
      Alert.alert('Sign In Failed', error?.message ?? 'Unknown error occurred')
      console.error('Browser signin error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="brain" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.logoText}>Second Brain</Text>
          <Text style={styles.tagline}>Your personal knowledge hub</Text>
        </View>

        {/* Browser Sign In */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign In with Browser</Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Open in Browser</Text>
              <Text style={styles.infoDesc}>
                Tap the button below to open your browser. Approve the device there and you'll be automatically signed in.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn]}
            onPress={handleBrowserSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="globe-outline" size={20} color={COLORS.white} />
                <Text style={styles.btnText}>Open Browser</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Tap the button</Text>
                <Text style={styles.stepDesc}>Opens your default browser</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sign In (if needed)</Text>
                <Text style={styles.stepDesc}>If you're not logged in</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Approve Device</Text>
                <Text style={styles.stepDesc}>Tap the approve button</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>All Set!</Text>
                <Text style={styles.stepDesc}>You're signed in to the app</Text>
              </View>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Other options</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Connect')}>
            <Ionicons name="qr-code-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Sign In with QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: SPACING.lg, justifyContent: 'center', gap: SPACING.xl },
  logoBox: { alignItems: 'center', gap: SPACING.sm },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.xs },
  infoBox: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, gap: SPACING.xs },
  infoTitle: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  infoDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, lineHeight: 18 },
  btn: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  primaryBtn: { backgroundColor: COLORS.primary },
  btnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: '700' },
  steps: { gap: SPACING.md },
  step: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  stepContent: { flex: 1, gap: SPACING.xs },
  stepTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  stepDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  backBtn: {
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
})
