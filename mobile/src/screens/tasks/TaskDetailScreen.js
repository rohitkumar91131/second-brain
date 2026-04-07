import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { tasksAPI } from '../../services/api'
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

const STATUSES = ['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold']
const PRIORITIES = ['High', 'Medium', 'Low']

export default function TaskDetailScreen({ route, navigation }) {
  const existing = route.params?.task ?? null
  const isNew = !existing

  const [title, setTitle] = useState(existing?.title ?? '')
  const [status, setStatus] = useState(existing?.status ?? 'Not Started')
  const [priority, setPriority] = useState(existing?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return }
    setSaving(true)
    try {
      const payload = { title: title.trim(), status, priority, dueDate, notes }
      if (isNew) {
        await tasksAPI.create(payload)
      } else {
        await tasksAPI.update(existing.id, payload)
      }
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error ?? e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTask = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await tasksAPI.delete(existing.id)
            navigation.goBack()
          } catch (e) {
            Alert.alert('Error', e.message)
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      {/* Nav bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isNew ? 'New Task' : 'Edit Task'}</Text>
        <View style={styles.navRight}>
          {!isNew && (
            <TouchableOpacity style={styles.navBtn} onPress={deleteTask}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.navBtn, styles.saveBtn]} onPress={save} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={COLORS.white} />
              : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Task title..."
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        {/* Status */}
        <Section label="Status">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {STATUSES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, status === s && styles.chipActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.chipText, status === s && styles.chipActiveText]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Section>

        {/* Priority */}
        <Section label="Priority">
          <View style={styles.chipRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, priority === p && styles.chipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, priority === p && styles.chipActiveText]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Due Date */}
        <Section label="Due Date (yyyy-MM-dd)">
          <TextInput
            style={styles.input}
            placeholder="e.g. 2025-12-31"
            placeholderTextColor={COLORS.textMuted}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </Section>

        {/* Notes */}
        <Section label="Notes">
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add any additional notes..."
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </Section>
      </ScrollView>
    </View>
  )
}

function Section({ label, children }) {
  return (
    <View style={secStyles.wrapper}>
      <Text style={secStyles.label}>{label}</Text>
      {children}
    </View>
  )
}

const secStyles = StyleSheet.create({
  wrapper: { gap: SPACING.xs, marginBottom: SPACING.md },
  label: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.md, fontWeight: '700', textAlign: 'center' },
  navRight: { flexDirection: 'row', gap: SPACING.xs },
  saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, width: 'auto' },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  scroll: { padding: SPACING.lg, gap: SPACING.xs },
  titleInput: {
    color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: '700',
    marginBottom: SPACING.lg, lineHeight: 32,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500' },
  chipActiveText: { color: COLORS.primary, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, color: COLORS.textPrimary, fontSize: FONT_SIZE.base,
    borderWidth: 1, borderColor: COLORS.border,
  },
  notesInput: { minHeight: 120 },
})
