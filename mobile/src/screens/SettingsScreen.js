import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { userAPI, devicesAPI } from '../services/api'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme'

export default function SettingsScreen({ navigation }) {
  const { user, logout, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [devices, setDevices] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [liveMode, setLiveMode] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    try {
      await userAPI.updateProfile({ name: name.trim() })
      setUser(prev => ({ ...prev, name: name.trim() }))
      setEditing(false)
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error ?? e.message)
    } finally { setSaving(false) }
  }

  const fetchDevices = useCallback(async () => {
    setLoadingDevices(true)
    try {
      const data = await devicesAPI.list()
      setDevices(data)
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch devices')
    } finally { setLoadingDevices(false) }
  }, [])

  useFocusEffect(useCallback(() => {
    if (liveMode) {
      fetchDevices()
      const interval = setInterval(fetchDevices, 5000) // Fetch every 5 seconds in live mode
      return () => clearInterval(interval)
    }
  }, [liveMode, fetchDevices]))

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Profile */}
      <Section title="Profile">
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            {editing ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
              />
            ) : (
              <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            )}
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          </View>
          {editing ? (
            <TouchableOpacity style={styles.editBtn} onPress={saveProfile} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="pencil-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Section>

      {/* Connection */}
      <Section title="Connection">
        <SettingRow
          icon="qr-code-outline"
          label="Connect with QR Code"
          subtitle="Re-pair this device with the web app"
          onPress={() => navigation.navigate('Connect')}
        />
      </Section>

      {/* Devices */}
      <Section title="Devices">
        <View style={styles.devicesHeader}>
          <View style={styles.devicesToggles}>
            <TouchableOpacity
              style={[styles.deviceBtn, !liveMode && styles.deviceBtnActive]}
              onPress={() => { setLiveMode(false); fetchDevices() }}
            >
              <Ionicons name="refresh-outline" size={16} color={!liveMode ? COLORS.white : COLORS.textMuted} />
              <Text style={[styles.deviceBtnText, !liveMode && styles.deviceBtnTextActive]}>Manual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deviceBtn, liveMode && styles.deviceBtnActive]}
              onPress={() => setLiveMode(!liveMode)}
            >
              <Ionicons name="radio-button-on-outline" size={16} color={liveMode ? COLORS.white : COLORS.textMuted} />
              <Text style={[styles.deviceBtnText, liveMode && styles.deviceBtnTextActive]}>Live</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loadingDevices && <ActivityIndicator color={COLORS.primary} style={styles.loader} />}
        {devices.length === 0 && !loadingDevices && (
          <Text style={styles.noDevices}>No devices connected</Text>
        )}
        {devices.map((device, idx) => (
          <View key={device.id || idx} style={styles.deviceRow}>
            <Ionicons name={device.platform === 'ios' ? 'phone-portrait-outline' : 'phone-portrait-outline'} size={20} color={COLORS.primary} />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.devicePlatform}>{device.platform}</Text>
            </View>
          </View>
        ))}
      </Section>

      {/* About */}
      <Section title="About">
        <SettingRow icon="information-circle-outline" label="Version" subtitle="1.0.0" />
        <SettingRow
          icon="globe-outline"
          label="Web App"
          subtitle="Open in browser"
          onPress={() => {}}
        />
      </Section>

      {/* Account */}
      <Section title="Account">
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </Section>
    </ScrollView>
  )
}

function Section({ title, children }) {
  return (
    <View style={secStyles.wrapper}>
      <Text style={secStyles.title}>{title}</Text>
      <View style={secStyles.card}>{children}</View>
    </View>
  )
}

function SettingRow({ icon, label, subtitle, onPress }) {
  return (
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={rowStyles.iconBox}><Ionicons name={icon} size={20} color={COLORS.primary} /></View>
      <View style={rowStyles.body}>
        <Text style={rowStyles.label}>{label}</Text>
        {subtitle && <Text style={rowStyles.subtitle}>{subtitle}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
    </TouchableOpacity>
  )
}

const secStyles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.lg },
  title: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm, paddingHorizontal: SPACING.xs },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
})

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconBox: { width: 36, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  label: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '500' },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING['2xl'] },
  pageTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', marginBottom: SPACING.xl },
  avatarRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  avatar: { width: 52, height: 52, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontSize: FONT_SIZE.xl, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700' },
  nameInput: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: COLORS.primary },
  userEmail: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 },
  editBtn: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
  logoutText: { color: COLORS.danger, fontSize: FONT_SIZE.base, fontWeight: '600' },
  devicesHeader: { padding: SPACING.md, gap: SPACING.md },
  devicesToggles: { flexDirection: 'row', gap: SPACING.sm },
  deviceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs },
  deviceBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  deviceBtnText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  deviceBtnTextActive: { color: COLORS.white },
  loader: { padding: SPACING.md },
  noDevices: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textAlign: 'center', padding: SPACING.md },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  deviceInfo: { flex: 1 },
  deviceName: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600' },
  devicePlatform: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2, textTransform: 'capitalize' },
})
