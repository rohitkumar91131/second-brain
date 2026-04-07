import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { notesAPI } from '../../services/api'
import BlockRenderer from '../../components/BlockRenderer'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function NoteDetailScreen({ route, navigation }) {
  const { noteId, title: initialTitle } = route.params ?? {}
  const isNew = !noteId

  const [note, setNote] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [title, setTitle] = useState(initialTitle ?? '')
  const [editTitle, setEditTitle] = useState(isNew)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) load()
  }, [noteId])

  const load = async () => {
    setLoading(true)
    try {
      const [noteData, blocksData] = await Promise.all([
        notesAPI.get(noteId),
        notesAPI.getBlocks(noteId),
      ])
      setNote(noteData)
      setTitle(noteData.title)
      setBlocks(blocksData)
    } catch (e) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return }
    setSaving(true)
    try {
      const created = await notesAPI.create({ title: title.trim() })
      navigation.replace('NoteDetail', { noteId: created.id, title: created.title })
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.error ?? e.message)
    } finally { setSaving(false) }
  }

  const saveTitle = async () => {
    if (!title.trim() || title === note?.title) { setEditTitle(false); return }
    try {
      await notesAPI.update(noteId, { title: title.trim() })
      setEditTitle(false)
    } catch (e) { Alert.alert('Error', e.message) }
  }

  const del = () => {
    Alert.alert('Delete Note', 'Move to recycle bin?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await notesAPI.delete(noteId); navigation.goBack() } catch (e) { Alert.alert('Error', e.message) } } },
    ])
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {!isNew && (
          <TouchableOpacity style={styles.navBtn} onPress={del}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        )}
        {isNew && (
          <TouchableOpacity style={[styles.navBtn, styles.createBtn]} onPress={createNote} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.createBtnText}>Create</Text>}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title */}
        {editTitle ? (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Note title..."
            placeholderTextColor={COLORS.textMuted}
            onBlur={isNew ? undefined : saveTitle}
            onSubmitEditing={isNew ? undefined : saveTitle}
            autoFocus
            multiline
          />
        ) : (
          <TouchableOpacity onPress={() => setEditTitle(true)}>
            <Text style={styles.titleText}>{title}</Text>
          </TouchableOpacity>
        )}

        {/* Blocks (read-only) */}
        {!isNew && (
          <View style={styles.blocksContainer}>
            {blocks.length > 0
              ? <BlockRenderer blocks={blocks} />
              : <Text style={styles.emptyBlocks}>This note has no content yet. Add content from the web app.</Text>
            }
          </View>
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
  createBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, width: 'auto' },
  createBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.sm, flexGrow: 1 },
  titleInput: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', lineHeight: 36, marginBottom: SPACING.lg },
  titleText: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', lineHeight: 36, marginBottom: SPACING.lg },
  blocksContainer: { flex: 1 },
  emptyBlocks: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.xl },
})
