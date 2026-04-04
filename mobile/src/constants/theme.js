export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  border: 'rgba(255,255,255,0.08)',
  primary: '#6366F1',
  primaryLight: 'rgba(99,102,241,0.15)',
  success: '#22C55E',
  successLight: 'rgba(34,197,94,0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245,158,11,0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239,68,68,0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59,130,246,0.15)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  white: '#FFFFFF',
}

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

export const STATUS_COLORS = {
  'Not Started': COLORS.textMuted,
  'In Progress': COLORS.primary,
  Active: COLORS.primary,
  Done: COLORS.success,
  Blocked: COLORS.danger,
  'On Hold': COLORS.warning,
}

export const PRIORITY_COLORS = {
  High: COLORS.danger,
  Medium: COLORS.warning,
  Low: COLORS.success,
}

export const MOOD_COLORS = {
  Amazing: '#A855F7',
  Good: '#22C55E',
  Okay: '#3B82F6',
  Tough: '#F59E0B',
  Bad: '#EF4444',
}

export const MOOD_EMOJI = {
  Amazing: '🚀',
  Good: '😊',
  Okay: '😐',
  Tough: '😓',
  Bad: '😞',
}
