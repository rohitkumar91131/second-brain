import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { projectsAPI } from '../../services/api'
import { StatusBadge } from '../../components/StatusBadge'
import ProgressBar from '../../components/ProgressBar'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await projectsAPI.list()
      setProjects(data)
      setFiltered(data)
    } catch (e) { console.warn(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleSearch = (q) => {
    setSearch(q)
    if (!q.trim()) { setFiltered(projects); return }
    setFiltered(projects.filter(p => p.title.toLowerCase().includes(q.toLowerCase())))
  }

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('ProjectDetail', { project: null })}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon="folder-open-outline" title="No projects yet" subtitle="Tap + to create your first project" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProjectDetail', { project: item })}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <StatusBadge status={item.status} />
            </View>
            {item.description ? (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <ProgressBar progress={item.progress ?? 0} height={4} />
            {item.dueDate && (
              <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
            )}
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
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  cardTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700', flex: 1 },
  cardDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  dueDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
})
