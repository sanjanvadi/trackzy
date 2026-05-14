// Category Configuration

import { Category } from '@/src/types/api';

// ============================================================================
// Category Icons (emoji or icon names)
// ============================================================================

export const categoryIcons: Record<Category, string> = {
  food: '🍔', // or 'restaurant' for icon library
  transport: '🚗', // or 'car'
  shopping: '🛍️', // or 'shopping-bag'
  health: '🏥', // or 'heart'
  entertainment: '🎬', // or 'film'
  bills: '📄', // or 'file-text'
  grocery: '🛒', // or 'shopping-cart'
  other: '📦', // or 'box'
};

// Icon names for react-native-vector-icons or @expo/vector-icons
export const categoryIconNames: Record<Category, string> = {
  food: 'restaurant',
  transport: 'car',
  shopping: 'shopping-bag',
  health: 'heart',
  entertainment: 'film',
  bills: 'file-text',
  grocery: 'shopping-cart',
  other: 'box',
};

// ============================================================================
// Category Colors (for icons and charts)
// ============================================================================

export const categoryColors: Record<Category, string> = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  shopping: '#FFE66D',
  health: '#95E1D3',
  entertainment: '#A8E6CF',
  bills: '#FFB6B9',
  grocery: '#FEC8D8',
  other: '#CFCFCF',
};

// Icon background colors (lighter versions)
export const categoryBackgroundColors: Record<Category, string> = {
  food: '#FFE5E5',
  transport: '#E0F7F5',
  shopping: '#FFF9E0',
  health: '#E8F8F5',
  entertainment: '#E8F8F0',
  bills: '#FFE8E8',
  grocery: '#FFF0F3',
  other: '#F5F5F5',
};

// ============================================================================
// Category Labels (display names)
// ============================================================================

export const categoryLabels: Record<Category, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  health: 'Health & Fitness',
  entertainment: 'Entertainment',
  bills: 'Bills & Utilities',
  grocery: 'Grocery',
  other: 'Other',
};

// ============================================================================
// Category List (for dropdowns)
// ============================================================================

export const categories: Category[] = [
  'food',
  'transport',
  'shopping',
  'health',
  'entertainment',
  'bills',
  'grocery',
  'other',
];

export interface CategoryOption {
  value: Category;
  label: string;
  icon: string;
  color: string;
}

export const categoryOptions: CategoryOption[] = categories.map((cat) => ({
  value: cat,
  label: categoryLabels[cat],
  icon: categoryIcons[cat],
  color: categoryColors[cat],
}));
