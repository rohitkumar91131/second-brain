import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { mediaAPI } from '../../services/api'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

const { width } = Dimensions.get('window')
const ITEM_SIZE = (width - SPACING.lg * 2 - SPACING.sm) / 2

export default function MediaScreen() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await mediaAPI.list()
      setMedia(Array.isArray(data) ? data : [])
    } catch (e) { console.warn(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = filter === 'all' ? media : media.filter(m => m.type === filter)

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Media Bank</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {['all', 'image', 'video', 'audio'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i, idx) => i.id ?? idx.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon="images-outline" title="No media yet" subtitle="Add images, videos, or audio to your notes to see them here" />}
        renderItem={({ item }) => (
          <View style={styles.mediaCard}>
            {item.type === 'image' && item.url
              ? <Image source={{ uri: item.url }} style={styles.mediaImage} resizeMode="cover" />
              : (
                <View style={styles.mediaPlaceholder}>
                  <Ionicons
                    name={item.type === 'video' ? 'play-circle-outline' : item.type === 'audio' ? 'musical-note-outline' : 'document-outline'}
                    size={32}
                    color={COLORS.textMuted}
                  />
                  <Text style={styles.mediaType}>{item.type}</Text>
                </View>
              )
            }
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500', textTransform: 'capitalize' },
  filterTextActive: { color: COLORS.primary, fontWeight: '700' },
  grid: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  row: { gap: SPACING.sm, marginBottom: SPACING.sm },
  mediaCard: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  mediaImage: { width: '100%', height: '100%' },
  mediaPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  mediaType: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
})
