import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { journalAPI } from '../../services/api'
import BlockRenderer from '../../components/BlockRenderer'
import { COLORS, FONT_SIZE, MOOD_EMOJI, MOOD_COLORS, RADIUS, SPACING } from '../../constants/theme'

const MOODS = ['Amazing', 'Good', 'Okay', 'Tough', 'Bad']

export default function JournalDetailScreen({ route, navigation }) {
  const { entryId } = route.params ?? {}
  const isNew = !entryId

  const [entry, setEntry] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState('Good')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [editingTitle, setEditingTitle] = useState(isNew)

  useEffect(() => {
    if (!isNew) load()
  }, [entryId])

  const load = async () => {
    setLoading(true)
    try {
      const [entryData, blocksData] = await Promise.all([
        journalAPI.get(entryId),
        journalAPI.getBlocks(entryId),
      ])
      setEntry(entryData)
      setTitle(entryData.title)
      setMood(entryData.mood ?? 'Good')
      setDate(entryData.date ?? format(new Date(), 'yyyy-MM-dd'))
      setBlocks(blocksData)
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return }
    setSaving(true)
    try {
      const created = await journalAPI.create({ title: title.trim(), mood, date })
      navigation.replace('JournalDetail', { entryId: created.id })
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error ?? e.message)
    } finally { setSaving(false) }
  }

  const save = async () => {
    try {
      await journalAPI.update(entryId, { title: title.trim(), mood, date })
      setEditingTitle(false)
    } catch (e) { Alert.alert('Error', e.message) }
  }

  const del = () => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await journalAPI.delete(entryId); navigation.goBack() } catch (e) { Alert.alert('Error', e.message) } } },
    ])
  }

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} /></TouchableOpacity>
        <View style={styles.navRight}>
          {!isNew && <TouchableOpacity style={styles.navBtn} onPress={del}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>}
          {isNew
            ? <TouchableOpacity style={[styles.navBtn, styles.saveBtn]} onPress={create} disabled={saving}>{saving ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.saveBtnText}>Create</Text>}</TouchableOpacity>
            : <TouchableOpacity style={[styles.navBtn, styles.saveBtn]} onPress={save}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Date & Mood row */}
        <View style={styles.metaRow}>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="yyyy-MM-dd"
            placeholderTextColor={COLORS.textMuted}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.moodRow}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.moodBtn, mood === m && { backgroundColor: (MOOD_COLORS[m] ?? COLORS.primary) + '33', borderColor: MOOD_COLORS[m] ?? COLORS.primary }]}
                  onPress={() => setMood(m)}
                >
                  <Text style={styles.moodEmoji}>{MOOD_EMOJI[m]}</Text>
                  <Text style={[styles.moodLabel, mood === m && { color: MOOD_COLORS[m] ?? COLORS.primary }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Title */}
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Entry title..."
          placeholderTextColor={COLORS.textMuted}
          multiline
        />

        {/* Blocks */}
        {!isNew && (
          blocks.length > 0
            ? <BlockRenderer blocks={blocks} />
            : <Text style={styles.emptyBlocks}>No content yet. Add content from the web app.</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  navBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  navRight: { flexDirection: 'row', gap: SPACING.xs },
  saveBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, width: 'auto' },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  scroll: { padding: SPACING.lg, gap: SPACING.md, flexGrow: 1 },
  metaRow: { gap: SPACING.sm },
  dateInput: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.xs },
  moodRow: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.xs },
  moodBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  moodEmoji: { fontSize: 14 },
  moodLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '600' },
  titleInput: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', lineHeight: 36 },
  emptyBlocks: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.xl },
})
