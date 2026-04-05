import React from 'react'
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native'
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme'

/**
 * Renders a subset of block types from the Second Brain block schema.
 * Supports: paragraph, heading1/2/3, bullet, numbered, todo, divider, callout, image, video, audio, table
 */
export default function BlockRenderer({ blocks = [] }) {
  if (!blocks.length) return null
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {blocks.map((block, idx) => (
        <BlockItem key={block.id ?? block._id ?? idx} block={block} />
      ))}
    </ScrollView>
  )
}

function BlockItem({ block }) {
  const { type, content } = block

  switch (type) {
    case 'heading1':
      return <Text style={styles.h1}>{content}</Text>
    case 'heading2':
      return <Text style={styles.h2}>{content}</Text>
    case 'heading3':
      return <Text style={styles.h3}>{content}</Text>
    case 'paragraph':
      return <Text style={styles.paragraph}>{content}</Text>
    case 'bullet':
      return (
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{content}</Text>
        </View>
      )
    case 'numbered':
      return (
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>{(block.order ?? 1) + '.'}</Text>
          <Text style={styles.bulletText}>{content}</Text>
        </View>
      )
    case 'todo':
      return (
        <View style={styles.bulletRow}>
          <Text style={styles.todoCheck}>{block.checked ? '☑' : '☐'}</Text>
          <Text style={[styles.bulletText, block.checked && styles.strikethrough]}>{content}</Text>
        </View>
      )
    case 'callout':
      return (
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{content}</Text>
        </View>
      )
    case 'divider':
      return <View style={styles.divider} />
    case 'image':
      return block.url ? (
        <Image source={{ uri: block.url }} style={styles.image} resizeMode="cover" />
      ) : null
    default:
      if (content) return <Text style={styles.paragraph}>{content}</Text>
      return null
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  h1: { color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', marginVertical: SPACING.sm },
  h2: { color: COLORS.textPrimary, fontSize: FONT_SIZE.xl, fontWeight: '700', marginVertical: SPACING.sm },
  h3: { color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '600', marginVertical: SPACING.xs },
  paragraph: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, lineHeight: 24, marginVertical: SPACING.xs },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm, marginVertical: 2 },
  bulletDot: { color: COLORS.textMuted, fontSize: FONT_SIZE.base, lineHeight: 24, minWidth: 16 },
  bulletText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, lineHeight: 24, flex: 1 },
  todoCheck: { color: COLORS.primary, fontSize: FONT_SIZE.md, lineHeight: 24, minWidth: 20 },
  strikethrough: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  callout: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  calloutText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.base, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  image: { width: '100%', height: 200, borderRadius: RADIUS.lg, marginVertical: SPACING.sm },
})
