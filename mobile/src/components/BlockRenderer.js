import React, { useState } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'
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
      return content ? <ImageWithFallback url={content} /> : null
    case 'video':
      return content ? <VideoBlock url={content} /> : null
    case 'table':
      return content ? <TableBlock data={content} /> : null
    case 'link':
      return content ? <LinkBlock data={content} /> : null
    case 'audio':
      return content ? <AudioBlock url={content} /> : null
    case 'toggle':
      return <ToggleBlock content={content} children={block.children} />
    default:
      if (content) return <Text style={styles.paragraph}>{content}</Text>
      return null
  }
}
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
        <ImageWithFallback url={block.url} />
      ) : null
    default:
      if (content) return <Text style={styles.paragraph}>{content}</Text>
      return null
  }
}

// Image component with better error handling and loading state
function ImageWithFallback({ url }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <View style={[styles.image, { backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>Image failed to load</Text>
      </View>
    )
  }

  return (
    <View style={styles.imageContainer}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.imageLoading}
        />
      )}
      <Image
        source={{ uri: url }}
        style={styles.image}
        resizeMode="cover"
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
      />
    </View>
  )
}

// Video block - handles YouTube, Vimeo, and local videos
function VideoBlock({ url }) {
  const getVideoEmbed = (videoUrl) => {
    if (!videoUrl) return null
    
    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Vimeo
    if (videoUrl.includes('vimeo.com')) {
      const id = videoUrl.split('vimeo.com/')[1]?.split('/')[0]
      return `https://player.vimeo.com/video/${id}`
    }
    
    // Direct video file
    if (videoUrl.match(/\.(mp4|webm|ogg|mov)$/i)) {
      return videoUrl
    }
    
    return videoUrl
  }

  const embedUrl = getVideoEmbed(url)
  if (!embedUrl) return null

  return (
    <View style={styles.videoContainer}>
      <WebView
        source={{ uri: embedUrl }}
        allowsFullscreenVideo={true}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" color={COLORS.primary} />}
      />
    </View>
  )
}

// Table block
function TableBlock({ data }) {
  let rows = [['', ''], ['', '']]
  
  try {
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
      rows = parsed
    }
  } catch (e) {
    // Fallback to default
  }

  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {rows.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.tableRow}>
              {row.map((cell, cIdx) => (
                <View
                  key={`cell-${rIdx}-${cIdx}`}
                  style={[
                    styles.tableCell,
                    rIdx === 0 && styles.tableHeaderCell,
                  ]}
                >
                  <Text style={rIdx === 0 ? styles.tableHeaderText : styles.tableCellText}>
                    {cell || '-'}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

// Link block  
function LinkBlock({ data }) {
  let linkData = { title: '', description: '', url: '' }
  
  try {
    const parsed = JSON.parse(data)
    linkData = parsed
  } catch (e) {
    linkData = { title: data, description: '', url: data }
  }

  const openLink = () => {
    Linking.openURL(linkData.url).catch(() => {})
  }

  return (
    <TouchableOpacity style={styles.linkContainer} onPress={openLink}>
      <Text style={styles.linkTitle} numberOfLines={2}>{linkData.title || linkData.url}</Text>
      {linkData.description && <Text style={styles.linkDesc} numberOfLines={2}>{linkData.description}</Text>}
      <Text style={styles.linkUrl} numberOfLines={1}>{linkData.url}</Text>
    </TouchableOpacity>
  )
}

// Audio block
function AudioBlock({ url }) {
  const [playing, setPlaying] = useState(false)

  return (
    <View style={styles.audioContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
        <TouchableOpacity
          onPress={() => setPlaying(!playing)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={20}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, flex: 1 }} numberOfLines={1}>
          {url.split('/').pop() || 'Audio'}
        </Text>
      </View>
    </View>
  )
}

// Toggle/Expandable block
function ToggleBlock({ content, children }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <View style={styles.toggle}>
      <TouchableOpacity
        style={styles.toggleHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.toggleTitle}>{content}</Text>
      </TouchableOpacity>
      {expanded && children && (
        <View style={styles.toggleContent}>
          <Text style={styles.paragraph}>{children}</Text>
        </View>
      )}
    </View>
  )
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
  imageContainer: { position: 'relative', marginVertical: SPACING.sm },
  imageLoading: { position: 'absolute', top: 80, left: '50%', marginLeft: -12, zIndex: 10 },
  videoContainer: { width: '100%', aspectRatio: 16/9, marginVertical: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.surface },
  tableContainer: { marginVertical: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.surface },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableCell: { flex: 1, padding: SPACING.sm, borderRightWidth: 1, borderRightColor: COLORS.border, justifyContent: 'center' },
  tableCellText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm },
  tableHeaderCell: { backgroundColor: COLORS.primaryLight, borderRightWidth: 1, borderRightColor: COLORS.border },
  tableHeaderText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZE.sm },
  linkContainer: { marginVertical: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  linkTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600', marginBottom: SPACING.xs },
  linkDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs },
  linkUrl: { color: COLORS.primary, fontSize: FONT_SIZE.xs },
  audioContainer: { marginVertical: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md },
  toggle: { marginVertical: SPACING.sm },
  toggleHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.md },
  toggleTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600', flex: 1 },
  toggleContent: { marginTop: SPACING.sm, paddingLeft: SPACING.lg, borderLeftWidth: 1, borderLeftColor: COLORS.border },
})
