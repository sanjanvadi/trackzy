import { useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import { useExpenses, useExpenseSummary, useDeleteExpense, useUpdateExpense } from '@/src/hooks/useExpenses';
import { formatCurrency } from '@/src/utils/currency';
import { getSectionTitle } from '@/src/utils/date';
import { categoryColors, categoryBackgroundColors, categoryLabels,categoryIconNames } from '@/src/constants/categories';
import { ExpenseRead, Category } from '@/src/types/api';
import { useLedger } from '@/src/contexts/LedgerContext';
import {Swipeable} from "react-native-gesture-handler";
import EditExpenseModal from '../components/EditExpenseModal';
import ConfirmModal from '../components/ConfirmModal';
import CreateExpenseModal from '../components/CreateExpenseModal';

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const { selectedLedger } = useLedger();
  const openSwipeableRef = useRef<any>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRead | null>(null);
  const [deletingExpense, setDeletingExpense] =  useState<ExpenseRead | null>(null);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  

  // Fetch default ledger and expenses
  const { data: expenses, isLoading } = useExpenses(selectedLedger?.id || '', {
    page: 1,
    per_page: 100, // Fetch more transactions
  });
  const { data: summary } = useExpenseSummary(selectedLedger?.id || '');

  const deleteExpenseMutation = useDeleteExpense();
  const updateExpenseMutation = useUpdateExpense();

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

    const confirmDelete = async () => {
      if (!deletingExpense || !selectedLedger) {
        return;
      }

      try {
        await deleteExpenseMutation.mutateAsync({
          ledgerId: selectedLedger.id,
          expenseId: deletingExpense.id,
        });

        setDeletingExpense(null);
      } catch (error: any) {
        console.error(
          "Failed to delete expense:",
          error
        );
      }
    };

  // const handleDelete = (ledgerId: string, expenseId: string, note: string) => {
  //   Alert.alert(
  //     'Delete Transaction',
  //     `Are you sure you want to delete "${note || 'this transaction'}"?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Delete',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             await deleteExpenseMutation.mutateAsync({ ledgerId, expenseId });
              
  //             setSwipedId(null);
  //           } catch (error: any) {
  //             Alert.alert('Error', error.message || 'Failed to delete transaction');
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleFilter = () => {
    // TODO: Open filter modal
    Alert.alert('Filters', 'Filter functionality coming soon!');
  };
  const renderTransaction = ({ item: expense }: { item: ExpenseRead }) => {
  const iconName = categoryIconNames[expense.category];
  const bgColor = categoryBackgroundColors[expense.category];
  const iconColor = categoryColors[expense.category];
  const categoryLabel = categoryLabels[expense.category];
  const swipeableRef = useRef<any>(null);

  const handleEdit = (expense: ExpenseRead) => {
    // Alert.alert('Edit Transaction', 'Edit functionality coming soon!');
    setEditingExpense(expense);
  };

  const handleDelete = (expense: ExpenseRead) => {
    swipeableRef.current?.close();

    if (
      openSwipeableRef.current ===
      swipeableRef.current
    ) {
      openSwipeableRef.current = null;
    }

    setDeletingExpense(expense);
  };

  const renderLeftActions = () => (
    <Pressable
      style={styles.editSwipeAction}
      onPress={() => {
        console.log("EDIT PRESS FIRED:", expense.id);

        swipeableRef.current?.close();

        requestAnimationFrame(() => {
          handleEdit(expense);
        });
      }}
    >
      <Feather name="edit-2" size={22} color="#FFFFFF" />
      <Text style={styles.swipeActionText}>Edit</Text>
    </Pressable>
  );

  const renderRightActions = () => (
    <Pressable
      style={styles.deleteSwipeAction}
      onPress={() =>{
        console.log("DELETE PRESS FIRED:", expense.id);
        handleDelete(expense)
      }}
    >
      <Feather name="trash-2" size={22} color="#FFFFFF" />
      <Text style={styles.swipeActionText}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      friction={1}

      onSwipeableWillOpen={() => {
        if (
          openSwipeableRef.current &&
          openSwipeableRef.current !== swipeableRef.current
        ) {
          openSwipeableRef.current.close();
        }

        openSwipeableRef.current = swipeableRef.current;
      }}
      onSwipeableClose={() => {
        if (openSwipeableRef.current === swipeableRef.current) {
          openSwipeableRef.current = null;
        }
      }}
    >
      <View style={styles.transactionContainer}>
        <Pressable
          style={[
            styles.transactionItem,
            { backgroundColor: colors.surface },
          ]}
        >
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
            <Text
              style={[
                styles.transactionName,
                { color: colors.textPrimary },
              ]}
            >
              {expense.note || categoryLabel}
            </Text>

            <Text
              style={[
                styles.transactionCategory,
                { color: colors.textSecondary },
              ]}
            >
              {categoryLabel}
            </Text>
          </View>

          <Text
            style={[
              styles.transactionAmount,
              { color: colors.textPrimary },
            ]}
          >
            -{formatCurrency(
              expense.amount,
              summary?.currency || "USD"
            )}
          </Text>
        </Pressable>
      </View>
    </Swipeable>
  );
};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trackzy</Text>
        <Pressable style={styles.themeToggle} onPress={toggleTheme}>
          <Feather name={isDark ? 'sun' : 'moon'} size={20} color={colors.textSecondary} />
        </Pressable>
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

      {/* Create Expense FAB */}
  <Pressable
    style={styles.addFab}
    onPress={() => setShowCreateExpenseModal(true)}
  >
    <Feather name="plus" size={28} color="#FFFFFF" />
  </Pressable>

      {/* Voice FAB */}
      <Pressable style={styles.voiceFab} onPress={() => router.push('/voice-recording')}>
        <Feather name="mic" size={28} color="#FFFFFF" />
      </Pressable>

{/* Edit expense Modal */}
      <EditExpenseModal
        visible={!!editingExpense}
        expense={editingExpense}
        loading={updateExpenseMutation.isPending}
        onClose={() => setEditingExpense(null)}
        onSave={async (expenseId, data) => {
          if (!selectedLedger) return;

          await updateExpenseMutation.mutateAsync({
            ledgerId: selectedLedger.id,
            expenseId,
            data,
          });

          setEditingExpense(null);
        }}
      />
{/* Create expense Modal */}
      <CreateExpenseModal
        visible={showCreateExpenseModal}
        onClose={() =>
          setShowCreateExpenseModal(false)
        }
      />

{/* Delete Expense Confirmation */}
      <ConfirmModal
        visible={!!deletingExpense}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${
          deletingExpense?.note ||
          "this transaction"
        }"?`}
        confirmText="Delete"
        cancelText="Cancel"
        icon="trash-2"
        destructive
        loading={deleteExpenseMutation.isPending}
        onCancel={() =>
          setDeletingExpense(null)
        }
        onConfirm={confirmDelete}
      />
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
  addFab: {
    position: "absolute",
    bottom: 156,
    right: SPACING.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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


editSwipeAction: {
  width: 90,
  backgroundColor: "#3B82F6",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: BORDER_RADIUS.lg,
  marginBottom: SPACING.xs,
},

deleteSwipeAction: {
  width: 90,
  backgroundColor: COLORS.error,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: BORDER_RADIUS.lg,
  marginBottom: SPACING.xs,
},

swipeActionText: {
  color: "#FFFFFF",
  fontSize: TYPOGRAPHY.fontSize.caption,
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
  marginTop: 4,
},
});
