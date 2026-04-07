import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { notesAPI } from '../../services/api'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await notesAPI.list()
      setNotes(data); setFiltered(data)
    } catch (e) { console.warn(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleSearch = (q) => {
    setSearch(q)
    setFiltered(!q.trim() ? notes : notes.filter(n => n.title.toLowerCase().includes(q.toLowerCase())))
  }

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NoteDetail', { noteId: null })}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search notes..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={handleSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="No notes yet" subtitle="Tap + to create your first note" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('NoteDetail', { noteId: item.id, title: item.title })} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {item.isPinned && <Ionicons name="pin" size={14} color={COLORS.primary} />}
            </View>
            {item.preview ? <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text> : null}
            <View style={styles.cardFooter}>
              {item.tags?.slice(0, 3).map(tag => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
              <Text style={styles.date}>{format(new Date(item.updatedAt), 'MMM d')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  cardTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700', flex: 1 },
  cardPreview: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.xs },
  tag: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  tagText: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: '600' },
  date: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginLeft: 'auto' },
})
