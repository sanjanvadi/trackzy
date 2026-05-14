// Trackzy Theme - Based on Design Specifications

export const COLORS = {
  // Primary Colors
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#4D94FF',

  // Background
  background: '#F5F7FA',
  white: '#FFFFFF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Status Colors
  success: '#00C853',
  error: '#FF3B30',
  warning: '#FF9500',
  income: '#00C853',
  expense: '#FF3B30',

  // UI Elements
  border: '#E5E7EB',
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
  },
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Category Colors
  housing: '#0066FF',
  food: '#1E293B',
  transport: '#94A3B8',
  utilities: '#CBD5E1',
};

export const TYPOGRAPHY = {
  fontSize: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    caption: 14,
    small: 12,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadow styles for elevation
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Deprecated - use SHADOWS instead
export const colors = COLORS;
export const typography = TYPOGRAPHY;
export const spacing = SPACING;
export const borderRadius = BORDER_RADIUS;
export const shadows = SHADOWS;
