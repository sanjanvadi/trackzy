import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SectionList,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import { useExpenses, useExpenseSummary, useDeleteExpense, useUpdateExpense } from '@/src/hooks/useExpenses';
import { getSectionTitle } from '@/src/utils/date';
import { ExpenseRead, Category } from '@/src/types/api';
import { useLedger } from '@/src/contexts/LedgerContext';
import ExpenseRow from '../components/Expense';
import CreateExpenseModal from '../components/CreateExpenseModal';
import ExpenseFilterModal from "../components/ExpenseFilterModal";
import {ExpenseFilters,defaultExpenseFilters} from "@/src/types/expenseFilters";

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedLedger } = useLedger();
  const openSwipeableRef = useRef<any>(null);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] =useState<ExpenseFilters>(defaultExpenseFilters);
  
  const hasActiveFilters =
    filters.startDate !== null ||
    filters.endDate !== null ||
    filters.category !== null ||
    filters.sort !== "date" ||
    filters.perPage !==
      defaultExpenseFilters.perPage;
      
  // Fetch default ledger and expenses
  const { data: expenses, isLoading } =
    useExpenses(
      selectedLedger?.id || "",
      {
        page: filters.page,
        per_page: filters.perPage,

        start_date:
          filters.startDate ??
          undefined,

        end_date:
          filters.endDate ??
          undefined,

        category:
          filters.category ??
          undefined,

        sorting:
          filters.sort,
      }
    );
  const { data: summary } = useExpenseSummary(selectedLedger?.id || '');

    // Filter by search query
  const searchedExpenses = expenses
    ? expenses.filter((expense) => {
    if (!searchQuery) {
      return true;
    }

    const query = searchQuery.toLowerCase();

    return (
      expense.note?.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query)
    );
  })
: [];

  // Group expenses by date
  const groupedExpenses = filters.sort ==="date"
    ? Object.entries(
        searchedExpenses.reduce((groups, expense) => {
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

  const shouldGroupByDate = filters.sort === "date";

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const renderTransaction = ({
    item,
  }: {
    item: ExpenseRead;
  }) => {
    return (
      <ExpenseRow
        expense={item}
        currency={summary?.currency || "USD"}
        openSwipeableRef={openSwipeableRef}
        shouldGroupByDate = {shouldGroupByDate}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background , paddingTop:25}]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trackzy</Text>
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
        <Pressable style={[styles.filterButton,hasActiveFilters && {backgroundColor: `${colors.primary}15`,},]}
          onPress={handleFilter}>
          <Feather
            name="sliders"
            size={20}
            color={
              hasActiveFilters
                ? colors.primary
                : colors.textPrimary
            }
          />

          {hasActiveFilters && (
            <View
              style={[
                styles.filterIndicator,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />
          )}
</Pressable>
      </View>

      {/* Transaction List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : searchedExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching transactions' : 'No transactions yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Start tracking your expenses'}
          </Text>
        </View>
      ) : shouldGroupByDate ? (
        <SectionList
          sections={groupedExpenses}
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
      ): (
        <FlatList
          data={searchedExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
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

{/* Create expense Modal */}
      <CreateExpenseModal
        visible={showCreateExpenseModal}
        onClose={() =>
          setShowCreateExpenseModal(false)
        }
      />

      <ExpenseFilterModal
        visible={showFilterModal}
        filters={filters}
        onClose={() =>
          setShowFilterModal(false)
        }
        onApply={(newFilters) => {
          setFilters(newFilters);
        }}
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
filterIndicator: {
  position: "absolute",
  right: 8,
  top: 8,
  width: 7,
  height: 7,
  borderRadius: 4,
},
});
