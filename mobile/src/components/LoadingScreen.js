import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { COLORS, FONT_SIZE } from '../constants/theme'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
})
