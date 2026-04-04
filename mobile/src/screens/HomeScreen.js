import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format, isToday, parseISO, isAfter } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { tasksAPI, projectsAPI, goalsAPI, notesAPI } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import LoadingScreen from '../components/LoadingScreen'
import { useFocusEffect } from '@react-navigation/native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme'

export default function HomeScreen({ navigation }) {
  const { user } = useAuth()
  const [data, setData] = useState({ tasks: [], projects: [], goals: [], notes: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [tasks, projects, goals, notes] = await Promise.all([
        tasksAPI.list().catch(() => []),
        projectsAPI.list().catch(() => []),
        goalsAPI.list().catch(() => []),
        notesAPI.list().catch(() => []),
      ])
      setData({ tasks, projects, goals, notes })
    } catch (e) { console.warn(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  if (loading) return <LoadingScreen message="Loading your brain..." />

  const now = new Date()
  const todayTasks = data.tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)))
  const activeProjects = data.projects.filter(p => p.status === 'Active').slice(0, 3)
  const activeGoals = data.goals.filter(g => g.status === 'Active' || g.status === 'In Progress').slice(0, 3)
  const recentNotes = [...data.notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} tintColor={COLORS.primary} />}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>{greeting}, <Text style={styles.greetingName}>{user?.name?.split(' ')[0] ?? 'Explorer'}</Text> 👋</Text>
        <Text style={styles.dateText}>{format(now, 'EEEE, MMMM d')}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Tasks Today', value: todayTasks.length, icon: 'checkbox-outline', color: COLORS.primary },
          { label: 'Active Projects', value: activeProjects.length, icon: 'folder-open-outline', color: '#A855F7' },
          { label: 'Active Goals', value: activeGoals.length, icon: 'trophy-outline', color: '#F59E0B' },
          { label: 'Notes', value: data.notes.length, icon: 'document-text-outline', color: '#22C55E' },
        ].map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <Section title="Due Today" onMore={() => navigation.navigate('Tasks')}>
          {todayTasks.slice(0, 5).map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskRow}
              onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { task } })}
            >
              <Ionicons name="ellipse-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
              <StatusBadge status={task.status} />
            </TouchableOpacity>
          ))}
        </Section>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <Section title="Active Projects" onMore={() => navigation.navigate('Projects')}>
          {activeProjects.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.projectCard}
              onPress={() => navigation.navigate('Projects', { screen: 'ProjectDetail', params: { project: p } })}
            >
              <Text style={styles.projectTitle} numberOfLines={1}>{p.title}</Text>
              <ProgressBar progress={p.progress ?? 0} height={4} />
            </TouchableOpacity>
          ))}
        </Section>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Section title="Goals" onMore={() => navigation.navigate('Goals')}>
          {activeGoals.map(g => (
            <TouchableOpacity
              key={g.id}
              style={styles.projectCard}
              onPress={() => navigation.navigate('Goals', { screen: 'GoalDetail', params: { goal: g } })}
            >
              <Text style={styles.projectTitle} numberOfLines={1}>{g.title}</Text>
              <ProgressBar progress={g.progress ?? 0} height={4} color="#F59E0B" />
            </TouchableOpacity>
          ))}
        </Section>
      )}

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <Section title="Recent Notes" onMore={() => navigation.navigate('Notes')}>
          <View style={styles.notesGrid}>
            {recentNotes.map(n => (
              <TouchableOpacity
                key={n.id}
                style={styles.noteCard}
                onPress={() => navigation.navigate('Notes', { screen: 'NoteDetail', params: { noteId: n.id, title: n.title } })}
              >
                <Text style={styles.noteTitle} numberOfLines={2}>{n.title}</Text>
                {n.preview && <Text style={styles.notePreview} numberOfLines={2}>{n.preview}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Section>
      )}
    </ScrollView>
  )
}

function Section({ title, onMore, children }) {
  return (
    <View style={secStyles.wrapper}>
      <View style={secStyles.header}>
        <Text style={secStyles.title}>{title}</Text>
        {onMore && (
          <TouchableOpacity onPress={onMore}>
            <Text style={secStyles.more}>See all →</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  )
}

const secStyles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  title: { color: COLORS.textPrimary, fontSize: FONT_SIZE.md, fontWeight: '700' },
  more: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING['2xl'] },
  greeting: { marginBottom: SPACING.xl },
  greetingText: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', lineHeight: 36 },
  greetingName: { color: COLORS.primary },
  dateText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 4 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: 4, alignItems: 'flex-start',
  },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  taskTitle: { flex: 1, color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  projectCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, gap: SPACING.sm },
  projectTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600' },
  notesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  noteCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  noteTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600', lineHeight: 18 },
  notePreview: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, lineHeight: 16 },
})
