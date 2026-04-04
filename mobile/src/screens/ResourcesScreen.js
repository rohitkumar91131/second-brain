import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { resourcesAPI } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import LoadingScreen from '../components/LoadingScreen'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme'

const TYPE_ICONS = {
  book: 'book-outline', article: 'document-text-outline', website: 'globe-outline',
  video: 'play-circle-outline', course: 'school-outline', podcast: 'mic-outline',
  tool: 'construct-outline',
}

const TYPES = ['book', 'article', 'website', 'video', 'course', 'podcast', 'tool']
const STATUSES = ['Want to Learn', 'In Progress', 'Completed', 'On Hold']

export default function ResourcesScreen({ navigation }) {
  const [resources, setResources] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('article')
  const [newUrl, setNewUrl] = useState('')
  const [newStatus, setNewStatus] = useState('Want to Learn')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await resourcesAPI.list()
      setResources(data); setFiltered(data)
    } catch (e) { console.warn(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleSearch = (q) => {
    setSearch(q)
    setFiltered(!q.trim() ? resources : resources.filter(r => r.title.toLowerCase().includes(q.toLowerCase())))
  }

  const addResource = async () => {
    if (!newTitle.trim()) { Alert.alert('Error', 'Title is required'); return }
    setAdding(true)
    try {
      const created = await resourcesAPI.create({ title: newTitle.trim(), type: newType, url: newUrl, status: newStatus })
      setResources(prev => [created, ...prev])
      setFiltered(prev => [created, ...prev])
      setShowAdd(false); setNewTitle(''); setNewUrl('')
    } catch (e) { Alert.alert('Error', e?.response?.data?.error ?? e.message) }
    finally { setAdding(false) }
  }

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(v => !v)}>
          <Ionicons name={showAdd ? 'close' : 'add'} size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput style={styles.input} placeholder="Title..." placeholderTextColor={COLORS.textMuted} value={newTitle} onChangeText={setNewTitle} />
          <TextInput style={styles.input} placeholder="URL (optional)..." placeholderTextColor={COLORS.textMuted} value={newUrl} onChangeText={setNewUrl} keyboardType="url" autoCapitalize="none" />
          <ScrollHChips items={TYPES} selected={newType} onSelect={setNewType} icon />
          <ScrollHChips items={STATUSES} selected={newStatus} onSelect={setNewStatus} />
          <TouchableOpacity style={styles.saveBtn} onPress={addResource} disabled={adding}>
            <Text style={styles.saveBtnText}>{adding ? 'Adding...' : 'Add Resource'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search resources..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={handleSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState icon="library-outline" title="No resources yet" subtitle="Tap + to add a resource" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name={TYPE_ICONS[item.type] ?? 'link-outline'} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {item.url ? <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text> : null}
              <StatusBadge status={item.status ?? 'Want to Learn'} />
            </View>
          </View>
        )}
      />
    </View>
  )
}

function ScrollHChips({ items, selected, onSelect, icon }) {
  return (
    <View>
      <ScrollHChipsInner items={items} selected={selected} onSelect={onSelect} />
    </View>
  )
}

function ScrollHChipsInner({ items, selected, onSelect }) {
  const { ScrollView } = require('react-native')
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.xs }}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, selected === item && styles.chipActive]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.chipText, selected === item && styles.chipActiveText]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  addForm: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  input: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, borderWidth: 1, borderColor: COLORS.border },
  chip: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '500' },
  chipActiveText: { color: COLORS.primary, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  cardIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600' },
  cardUrl: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
})
