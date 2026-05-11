import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SectionList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import { useDefaultLedger } from '@/src/hooks/useLedgers';
import { useExpenses, useExpenseSummary, useDeleteExpense } from '@/src/hooks/useExpenses';
import { formatCurrency } from '@/src/utils/currency';
import { getSectionTitle } from '@/src/utils/date';
import { categoryColors, categoryBackgroundColors, categoryLabels } from '@/src/constants/categories';
import { ExpenseRead, Category } from '@/src/types/api';

// Category icon mapping
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

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Fetch default ledger and expenses
  const { data: defaultLedger } = useDefaultLedger();
  const { data: expenses, isLoading } = useExpenses(defaultLedger?.id || '', {
    page: 1,
    per_page: 100, // Fetch more transactions
  });
  const { data: summary } = useExpenseSummary(defaultLedger?.id || '');

  const deleteExpenseMutation = useDeleteExpense();

  // Group expenses by date
  const groupedExpenses = expenses
    ? Object.entries(
        expenses.reduce((groups, expense) => {
          const title = getSectionTitle(expense.date);
          if (!groups[title]) {
            groups[title] = [];
          }
          groups[title].push(expense);
          return groups;
        }, {} as Record<string, ExpenseRead[]>)
      ).map(([title, data]) => ({
        title,
        data,
      }))
    : [];

  // Filter by search query
  const filteredExpenses = searchQuery
    ? groupedExpenses
        .map((section) => ({
          ...section,
          data: section.data.filter(
            (expense) =>
              expense.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              expense.category.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.data.length > 0)
    : groupedExpenses;

  const handleDelete = (ledgerId: string, expenseId: string, note: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${note || 'this transaction'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpenseMutation.mutateAsync({ ledgerId, expenseId });
              setSwipedId(null);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleFilter = () => {
    // TODO: Open filter modal
    Alert.alert('Filters', 'Filter functionality coming soon!');
  };

  const renderTransaction = ({ item: expense }: { item: ExpenseRead }) => {
    const iconName = getCategoryIcon(expense.category);
    const bgColor = categoryBackgroundColors[expense.category];
    const iconColor = categoryColors[expense.category];
    const categoryLabel = categoryLabels[expense.category];
    const isSwiped = swipedId === expense.id;

    return (
      <View style={styles.transactionContainer}>
        {/* Delete Button (revealed on swipe) */}
        {isSwiped && (
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDelete(defaultLedger!.id, expense.id, expense.note || '')}
          >
            <Feather name="trash-2" size={24} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Transaction Item */}
        <Pressable
          style={styles.transactionItem}
          onLongPress={() => setSwipedId(isSwiped ? null : expense.id)}
        >
          <View style={[styles.transactionIcon, { backgroundColor: bgColor }]}>
            <Feather name={iconName as any} size={24} color={iconColor} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>
              {expense.note || categoryLabel}
            </Text>
            <Text style={styles.transactionCategory}>{categoryLabel}</Text>
          </View>
          <Text style={styles.transactionAmount}>
            -{formatCurrency(expense.amount, summary?.currency || 'USD')}
          </Text>
        </Pressable>
      </View>
    );
  };

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterButton} onPress={handleFilter}>
          <Feather name="sliders" size={20} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* Transaction List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching transactions' : 'No transactions yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Start tracking your expenses'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  transactionContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
  transactionCategory: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.h4,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
