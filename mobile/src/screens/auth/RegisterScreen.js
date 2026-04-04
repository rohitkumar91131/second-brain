import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await register(name.trim(), email.toLowerCase().trim(), password)
      Alert.alert('Success', 'Account created! Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ])
    } catch (e) {
      Alert.alert('Registration Failed', e?.response?.data?.error ?? e.message ?? 'Unknown error')
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Second Brain today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: SPACING.lg, gap: SPACING.xl, justifyContent: 'center' },
  header: { gap: SPACING.xs },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  form: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'],
    padding: SPACING.lg, gap: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  field: { gap: SPACING.xs },
  label: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg,
    padding: SPACING.md, color: COLORS.textPrimary, fontSize: FONT_SIZE.base,
    borderWidth: 1, borderColor: COLORS.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 0,
    borderTopRightRadius: RADIUS.lg, borderBottomRightRadius: RADIUS.lg,
    padding: SPACING.md, justifyContent: 'center',
  },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xs,
  },
  btnText: { color: COLORS.white, fontSize: FONT_SIZE.base, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: SPACING.xs },
  loginLinkText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  loginLinkBold: { color: COLORS.primary, fontWeight: '700' },
})
