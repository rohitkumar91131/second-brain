import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView, TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import * as Device from 'expo-device'
import * as Application from 'expo-application'
import { useAuth } from '../../context/AuthContext'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'
import { v4 as uuidv4 } from 'uuid'

export default function OtpConnectScreen({ navigation }) {
  const { loginWithOTP } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('email') // 'email' | 'otp'

  const handleConnect = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedOtp = otp.trim()

    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }
    if (step === 'otp' && trimmedOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP from the website')
      return
    }

    if (step === 'email') {
      setStep('otp')
      return
    }

    setLoading(true)
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android'
      const deviceName = Device.deviceName || `${Platform.OS} Device`
      let deviceId = Application.androidId || (await SecureStore.getItemAsync('deviceId')) || uuidv4()
      await SecureStore.setItemAsync('deviceId', deviceId)

      await loginWithOTP(trimmedEmail, trimmedOtp, deviceName, platform, deviceId)
    } catch (error) {
      Alert.alert('Connection Failed', error?.response?.data?.error ?? error?.message ?? 'Invalid OTP or email', [
        { text: 'Try Again', onPress: () => { setLoading(false) } },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="key" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.logoText}>Connect via OTP</Text>
          <Text style={styles.tagline}>Enter your email and 6-digit code</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {step === 'email' ? 'Step 1: Enter Email' : 'Step 2: Enter OTP'}
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>
                {step === 'email' ? 'Your Account Email' : 'Get OTP from Website'}
              </Text>
              <Text style={styles.infoDesc}>
                {step === 'email'
                  ? 'Enter the email address associated with your Second Brain account.'
                  : 'Go to secondbrain.rohits.online → Dashboard → Connect → "Connect via OTP" to see your 6-digit code.'}
              </Text>
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={step === 'email'}
            />
            {step === 'otp' && (
              <TouchableOpacity onPress={() => setStep('email')} style={styles.editEmailBtn}>
                <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* OTP Input - only shown in step 2 */}
          {step === 'otp' && (
            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="6-digit OTP"
                placeholderTextColor={COLORS.textMuted}
                value={otp}
                onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons
                  name={step === 'email' ? 'arrow-forward' : 'checkmark-circle'}
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.btnText}>
                  {step === 'email' ? 'Next' : 'Connect Device'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Steps guide */}
          <View style={styles.steps}>
            {[
              { num: '1', title: 'Open website', desc: 'Go to secondbrain.rohits.online' },
              { num: '2', title: 'Navigate', desc: 'Dashboard → Connect → "Connect via OTP"' },
              { num: '3', title: 'Copy OTP', desc: 'See the 6-digit code on screen' },
              { num: '4', title: 'Enter here', desc: 'Enter your email + OTP above' },
            ].map(s => (
              <View key={s.num} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{s.num}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Other options</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Connect')}>
            <Ionicons name="qr-code-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Scan QR Code Instead</Text>
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
    width: 72, height: 72, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  logoText: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  form: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'],
    padding: SPACING.lg, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  formTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.xs },
  infoBox: {
    flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'flex-start',
  },
  infoText: { flex: 1, gap: SPACING.xs },
  infoTitle: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  infoDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, lineHeight: 18 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.base },
  otpInput: { letterSpacing: 8, fontWeight: '800', fontSize: FONT_SIZE.xl },
  editEmailBtn: { padding: SPACING.xs },
  btn: {
    borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs,
  },
  primaryBtn: { backgroundColor: COLORS.primary },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: '700' },
  steps: { gap: SPACING.md },
  step: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  stepNum: {
    width: 32, height: 32, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  stepContent: { flex: 1, gap: SPACING.xs },
  stepTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  stepDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.xs, padding: SPACING.md, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  backBtn: {
    padding: SPACING.md, alignItems: 'center', borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
})
