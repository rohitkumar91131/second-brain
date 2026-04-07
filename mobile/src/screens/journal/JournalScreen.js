import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { journalAPI } from '../../services/api'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, MOOD_EMOJI, MOOD_COLORS, RADIUS, SPACING } from '../../constants/theme'

export default function JournalScreen({ navigation }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await journalAPI.list()
      setEntries(data)
    } catch (e) { console.warn(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('JournalDetail', { entryId: null })}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={entries}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon="journal-outline" title="No journal entries yet" subtitle="Tap + to start journaling" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JournalDetail', { entryId: item.id })} activeOpacity={0.7}>
            <View style={styles.cardTop}>
              <Text style={styles.cardDate}>{item.date ?? format(new Date(item.createdAt), 'yyyy-MM-dd')}</Text>
              <View style={[styles.moodBadge, { backgroundColor: (MOOD_COLORS[item.mood] ?? COLORS.primary) + '22' }]}>
                <Text style={styles.moodEmoji}>{MOOD_EMOJI[item.mood] ?? '📝'}</Text>
                <Text style={[styles.moodText, { color: MOOD_COLORS[item.mood] ?? COLORS.primary }]}>{item.mood}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            {item.preview ? <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text> : null}
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
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, fontWeight: '600' },
  moodBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  moodEmoji: { fontSize: 12 },
  moodText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  cardTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700' },
  cardPreview: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18 },
})
