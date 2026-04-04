import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../constants/theme'

export default function ProgressBar({ progress = 0, showLabel = true, height = 6, color = COLORS.primary }) {
  const pct = Math.min(100, Math.max(0, progress))
  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, height }]} />
      </View>
      {showLabel && <Text style={styles.label}>{pct}%</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
})
