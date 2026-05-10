import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { formatCurrency } from '@/src/utils/currency';
import { formatDate, getRelativeTime } from '@/src/utils/date';
import { useDefaultLedger } from '@/src/hooks/useLedgers';
import { useExpenses, useExpenseSummary } from '@/src/hooks/useExpenses';
import { categoryIcons, categoryColors, categoryBackgroundColors } from '@/src/constants/categories';
import { Category } from '@/src/types/api';

// Category icon mapping for Feather icons
const getCategoryIcon = (category: Category): string => {
  const iconMap: Record<Category, string> = {
    food: 'coffee',
    transport: 'truck',
    shopping: 'shopping-bag',
    health: 'heart',
    entertainment: 'film',
    bills: 'file-text',
    grocery: 'shopping-cart',
    other: 'package',
  };
  return iconMap[category] || 'package';
};

export default function DashboardScreen() {
  const { user } = useAuth();

  // Fetch default ledger
  const { data: defaultLedger, isLoading: ledgerLoading } = useDefaultLedger();

  // Fetch expenses and summary for default ledger
  const { data: expenses, isLoading: expensesLoading } = useExpenses(
    defaultLedger?.id || '',
    { page: 1, per_page: 5 } // Get recent 5 transactions
  );

  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(
    defaultLedger?.id || '',
    { period: 'this_month' }
  );

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  const handleVoiceInput = () => {
    // TODO: Navigate to voice input screen
    console.log('Voice input');
  };

  const handleViewAll = () => {
    // TODO: Navigate to history tab
    console.log('View all transactions');
  };

  const isLoading = ledgerLoading || expensesLoading || summaryLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.menuButton}>
          <Feather name="menu" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Trackzy</Text>
        <View style={styles.menuButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>{currentMonth} Budget</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
          ) : (
            <>
              <Text style={styles.budgetAmount}>
                {formatCurrency(summary?.total || 0, summary?.currency || 'USD')}
              </Text>
              <View style={styles.budgetIndicators}>
                <View style={styles.indicator}>
                  <Feather name="arrow-up" size={16} color={COLORS.primary} />
                  <Text style={[styles.indicatorText, { color: COLORS.primary }]}>
                    Income
                  </Text>
                </View>
                <View style={styles.indicator}>
                  <Feather name="arrow-down" size={16} color={COLORS.error} />
                  <Text style={[styles.indicatorText, { color: COLORS.error }]}>
                    Spent
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={handleViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.transactionsList}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
            ) : expenses && expenses.length > 0 ? (
              expenses.map((expense) => {
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
                        {getRelativeTime(expense.date)}
                      </Text>
                    </View>
                    <Text style={[styles.transactionAmount, styles.amountNegative]}>
                      -{formatCurrency(expense.amount, summary?.currency || 'USD')}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Start by adding an expense</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Voice FAB */}
      <Pressable style={styles.voiceFab} onPress={handleVoiceInput}>
        <Feather name="mic" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  budgetLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  budgetAmount: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  budgetIndicators: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  indicatorText: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
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
  voiceFab: {
    position: 'absolute',
    bottom: 80,
    right: SPACING.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
