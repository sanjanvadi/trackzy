import { View, Text, StyleSheet, Pressable} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS} from '@/src/constants/theme';
import { formatCurrency } from '@/src/utils/currency';
import { getRelativeTime } from '@/src/utils/date';
import { categoryIconNames, categoryColors, categoryBackgroundColors } from '@/src/constants/categories';
import { Category, ExpenseRead, ExpenseSummary } from '@/src/types/api';

// Category icon mapping for Feather icons
const getCategoryIcon = (category: Category): string => {
  return categoryIconNames[category] || 'package';
};


export default function ExpenseRow({ expense, currency }: { expense: ExpenseRead; currency: string }) {

    const iconName = getCategoryIcon(expense.category);
    const bgColor = categoryBackgroundColors[expense.category];
    const iconColor = categoryColors[expense.category];

    return (
        <Pressable key={expense.id} style={styles.transactionItem}>
        <View
            style={[
            styles.transactionIcon,
            { backgroundColor: bgColor },
            ]}
        >
            <Feather
            name={iconName as any}
            size={24}
            color={iconColor}
            />
        </View>
        <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>
            {expense.note || expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
            </Text>
            <Text style={styles.transactionDate}>
            {getRelativeTime(expense.created_at)}
            </Text>
        </View>
        <Text style={[styles.transactionAmount, styles.amountNegative]}>
            -{formatCurrency(expense.amount, currency || 'USD')}
        </Text>
        </Pressable>
    );
}


const styles = StyleSheet.create({
  transactionsList: {
    gap: SPACING.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  amountPositive: {
    color: COLORS.success,
  },
  amountNegative: {
    color: COLORS.textPrimary,
  },
})