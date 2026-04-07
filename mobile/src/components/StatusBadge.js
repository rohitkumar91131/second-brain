import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { STATUS_COLORS, PRIORITY_COLORS, COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme'

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? COLORS.textMuted
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  )
}

export function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] ?? COLORS.textMuted
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.text, { color }]}>{priority}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
