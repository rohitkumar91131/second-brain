import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/theme'

import HomeScreen from '../screens/HomeScreen'
import TasksScreen from '../screens/tasks/TasksScreen'
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen'
import ProjectsScreen from '../screens/projects/ProjectsScreen'
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen'
import GoalsScreen from '../screens/goals/GoalsScreen'
import GoalDetailScreen from '../screens/goals/GoalDetailScreen'
import NotesScreen from '../screens/notes/NotesScreen'
import NoteDetailScreen from '../screens/notes/NoteDetailScreen'
import JournalScreen from '../screens/journal/JournalScreen'
import JournalDetailScreen from '../screens/journal/JournalDetailScreen'
import ResourcesScreen from '../screens/ResourcesScreen'
import MediaScreen from '../screens/MediaScreen'
import SettingsScreen from '../screens/SettingsScreen'
import ConnectScreen from '../screens/auth/ConnectScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// ─── Stack Navigators for each tab ─────────────────────────────────────────

function HomeStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="HomeMain" component={HomeScreen} />
    </S.Navigator>
  )
}

function TasksStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="TasksList" component={TasksScreen} />
      <S.Screen name="TaskDetail" component={TaskDetailScreen} />
    </S.Navigator>
  )
}

function ProjectsStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="ProjectsList" component={ProjectsScreen} />
      <S.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </S.Navigator>
  )
}

function GoalsStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="GoalsList" component={GoalsScreen} />
      <S.Screen name="GoalDetail" component={GoalDetailScreen} />
    </S.Navigator>
  )
}

function NotesStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="NotesList" component={NotesScreen} />
      <S.Screen name="NoteDetail" component={NoteDetailScreen} />
    </S.Navigator>
  )
}

function JournalStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="JournalList" component={JournalScreen} />
      <S.Screen name="JournalDetail" component={JournalDetailScreen} />
    </S.Navigator>
  )
}

function MoreStack() {
  const S = createNativeStackNavigator()
  return (
    <S.Navigator screenOptions={{ headerShown: false }}>
      <S.Screen name="Resources" component={ResourcesScreen} />
      <S.Screen name="Media" component={MediaScreen} />
      <S.Screen name="Settings" component={SettingsScreen} />
      <S.Screen name="Connect" component={ConnectScreen} />
    </S.Navigator>
  )
}

// ─── Root Tab Navigator ─────────────────────────────────────────────────────

export default function DashboardNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Tasks: focused ? 'checkbox' : 'checkbox-outline',
            Projects: focused ? 'folder' : 'folder-outline',
            Goals: focused ? 'trophy' : 'trophy-outline',
            Notes: focused ? 'document-text' : 'document-text-outline',
            Journal: focused ? 'journal' : 'journal-outline',
            More: focused ? 'grid' : 'grid-outline',
          }
          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Notes" component={NotesStack} />
      <Tab.Screen name="Journal" component={JournalStack} />
      <Tab.Screen name="More" component={MoreStack} />
    </Tab.Navigator>
  )
}
