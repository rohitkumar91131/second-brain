import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { projectsAPI } from '../../services/api'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

const STATUSES = ['Not Started', 'In Progress', 'Active', 'Done', 'On Hold', 'Blocked']

export default function ProjectDetailScreen({ route, navigation }) {
  const existing = route.params?.project ?? null
  const isNew = !existing

  const [title, setTitle] = useState(existing?.title ?? '')
  const [status, setStatus] = useState(existing?.status ?? 'Active')
  const [progress, setProgress] = useState(String(existing?.progress ?? 0))
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(), status,
        progress: Math.min(100, Math.max(0, parseInt(progress) || 0)),
        dueDate, description,
      }
      if (isNew) await projectsAPI.create(payload)
      else await projectsAPI.update(existing.id, payload)
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error ?? e.message)
    } finally { setSaving(false) }
  }

  const del = () => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await projectsAPI.delete(existing.id); navigation.goBack() }
          catch (e) { Alert.alert('Error', e.message) }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isNew ? 'New Project' : 'Edit Project'}</Text>
        <View style={styles.navRight}>
          {!isNew && (
            <TouchableOpacity style={styles.navBtn} onPress={del}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.navBtn, styles.saveBtn]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput style={styles.titleInput} placeholder="Project title..." placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} multiline />

        <Section label="Status">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {STATUSES.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}>
                  <Text style={[styles.chipText, status === s && styles.chipActiveText]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Section>

        <Section label="Progress (0-100)">
          <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.textMuted} value={progress} onChangeText={setProgress} keyboardType="numeric" />
        </Section>

        <Section label="Due Date (yyyy-MM-dd)">
          <TextInput style={styles.input} placeholder="e.g. 2025-12-31" placeholderTextColor={COLORS.textMuted} value={dueDate} onChangeText={setDueDate} />
        </Section>

        <Section label="Description">
          <TextInput style={[styles.input, styles.multiline]} placeholder="What is this project about?" placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} multiline textAlignVertical="top" />
        </Section>
      </ScrollView>
    </View>
  )
}

function Section({ label, children }) {
  return (
    <View style={{ gap: SPACING.xs, marginBottom: SPACING.md }}>
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md, gap: SPACING.sm },
  navBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.md, fontWeight: '700', textAlign: 'center' },
  navRight: { flexDirection: 'row', gap: SPACING.xs },
  saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, width: 'auto' },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  scroll: { padding: SPACING.lg, gap: SPACING.xs },
  titleInput: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.lg, lineHeight: 32 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  chipActiveText: { color: COLORS.primary, fontWeight: '700' },
  input: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.textPrimary, fontSize: FONT_SIZE.base, borderWidth: 1, borderColor: COLORS.border },
  multiline: { minHeight: 100 },
})
