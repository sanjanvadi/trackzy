import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { formatCurrency } from '@/src/utils/currency';
import { useExpenses, useExpenseSummary } from '@/src/hooks/useExpenses';
import LedgerSelector from '../components/LedgerSelector';
import { useLedger } from '@/src/contexts/LedgerContext';
import ExpenseRow from '../components/Expense';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  // Fetch default ledger
  const { selectedLedger, loading: ledgerLoading } = useLedger();

  // Fetch expenses and summary for default ledger
  const { data: expenses, isLoading: expensesLoading } = useExpenses(
    selectedLedger?.id || '',
    { page: 1, per_page: 10 } // Get recent 10 transactions
  );

  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(
    selectedLedger?.id || '',
    { period: 'all' }
  );

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  const handleVoiceInput = () => {
    router.push('/voice-recording');
  };

  const handleViewAll = () => {
    router.push('/(tabs)/history')
  };

  const isLoading = ledgerLoading || expensesLoading || summaryLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trackzy</Text>
        <Pressable style={styles.themeToggle} onPress={toggleTheme}>
          <Feather name={isDark ? 'sun' : 'moon'} size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>{currentMonth} Expenses</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
          ) : (
            <>
              <Text style={styles.budgetAmount}>
                {formatCurrency(summary?.total || 0, summary?.currency || 'USD')}
              </Text>
            </>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LedgerSelector />
            <Pressable onPress={handleViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.transactionsList}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
            ) : expenses && expenses.length > 0 ? (
              <>
              <Text style= {[styles.sectionTitle, { textAlign: 'center' ,fontSize: TYPOGRAPHY.fontSize.h4}]}>Recent Expenses</Text>
              {expenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} currency={summary?.currency || 'USD'} />
              ))}
              </>
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
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
