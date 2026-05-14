import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useDefaultLedger } from '@/src/hooks/useLedgers';
import { useExpenseSummary } from '@/src/hooks/useExpenses';
import { formatCurrency } from '@/src/utils/currency';
import { categoryColors, categoryLabels } from '@/src/constants/categories';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'this_week' | 'this_month'>('this_month');

  // Fetch default ledger and summary
  const { data: defaultLedger } = useDefaultLedger();
  const { data: summary, isLoading } = useExpenseSummary(defaultLedger?.id || '', {
    period: selectedPeriod,
  });

  // Prepare chart data
  const categoryData = summary?.breakdown?.map((item) => ({
    x: categoryLabels[item.category],
    y: item.total,
    color: categoryColors[item.category],
    percentage: summary.total > 0 ? ((item.total / summary.total) * 100).toFixed(0) : '0',
  })) || [];

  // Mock weekly data (TODO: Get from backend when available)
  const weeklyData = [
    { day: 'M', amount: 45 },
    { day: 'T', amount: 120 },
    { day: 'W', amount: 65 },
    { day: 'T', amount: 90 },
    { day: 'F', amount: 150 },
    { day: 'S', amount: 30 },
    { day: 'S', amount: 80 },
  ];

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
        {/* Financial Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.pageTitle}>Financial Overview</Text>
          <Text style={styles.pageSubtitle}>
            Here is a breakdown of your recent activity.
          </Text>
        </View>

        {/* Spending by Category */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Spending by Category</Text>
            <Pressable style={styles.moreButton}>
              <Feather name="more-horizontal" size={20} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.xxl }} />
          ) : categoryData.length > 0 ? (
            <>
              {/* Total */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>TOTAL SPENDING</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(summary?.total || 0, summary?.currency || 'USD')}
                </Text>
              </View>

              {/* Category List */}
              <View style={styles.categoryList}>
                {categoryData.map((item, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryLabel}>{item.x}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(item.y, summary?.currency || 'USD')}
                      </Text>
                      <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyChart}>
              <Feather name="pie-chart" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No spending data</Text>
            </View>
          )}
        </View>

        {/* Weekly Spending */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Spending</Text>
            <View style={styles.periodChip}>
              <Text style={styles.periodChipText}>Last 7 Days</Text>
            </View>
          </View>

          <View style={styles.weeklyList}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.weeklyItem}>
                <Text style={styles.weeklyDay}>{day.day}</Text>
                <View style={styles.weeklyBarContainer}>
                  <View
                    style={[
                      styles.weeklyBar,
                      { height: `${(day.amount / 150) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.weeklyAmount}>${day.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Voice FAB */}
      <Pressable style={styles.voiceFab} onPress={() => router.push('/voice-recording')}>
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
  overviewSection: {
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  periodChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  periodChipText: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
  },
  totalContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  categoryList: {
    gap: SPACING.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
  },
  weeklyList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingVertical: SPACING.lg,
  },
  weeklyItem: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyDay: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  weeklyBarContainer: {
    width: 24,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  weeklyBar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  weeklyAmount: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
