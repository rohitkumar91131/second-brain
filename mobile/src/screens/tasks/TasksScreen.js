import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { tasksAPI } from '../../services/api'
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme'

export default function TasksScreen({ navigation }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await tasksAPI.list()
      setTasks(data)
      setFiltered(data)
    } catch (e) {
      console.warn(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!search.trim()) { setFiltered(tasks); return }
    const q = search.toLowerCase()
    setFiltered(tasks.filter(t => t.title.toLowerCase().includes(q)))
  }, [search, tasks])

  if (loading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('TaskDetail', { task: null })}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="No tasks yet"
            subtitle="Tap + to create your first task"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.completed && styles.cardDone]}
            onPress={() => navigation.navigate('TaskDetail', { task: item })}
            activeOpacity={0.7}
          >
            <View style={styles.cardLeft}>
              <TouchableOpacity
                onPress={() => {
                  const updated = { ...item, completed: !item.completed }
                  setTasks(prev => prev.map(t => t.id === item.id ? updated : t))
                  tasksAPI.update(item.id, { completed: !item.completed }).catch(console.warn)
                }}
                style={styles.checkbox}
              >
                <Ionicons
                  name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={item.completed ? COLORS.success : COLORS.textMuted}
                />
              </TouchableOpacity>
              <View style={styles.cardBody}>
                <Text style={[styles.taskTitle, item.completed && styles.strikethrough]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.badgeRow}>
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                  {item.dueDate && (
                    <Text style={styles.dueDate}>
                      {format(parseISO(item.dueDate), 'MMM d')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
  },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' },
  addBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
  },
  cardDone: { opacity: 0.6 },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkbox: { padding: 2 },
  cardBody: { flex: 1, gap: 4 },
  taskTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600' },
  strikethrough: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, alignItems: 'center' },
  dueDate: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
})
