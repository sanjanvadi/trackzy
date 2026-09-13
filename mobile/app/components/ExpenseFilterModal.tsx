import { useEffect, useState } from "react";

import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { useTheme } from "@/src/contexts/ThemeContext";

import { categories, categoryLabels } from "@/src/constants/categories";

import {
  ExpenseFilters,
  ExpenseSort,
  defaultExpenseFilters,
} from "@/src/types/expenseFilters";

interface ExpenseFilterModalProps {
  visible: boolean;
  filters: ExpenseFilters;

  onClose: () => void;
  onApply: (filters: ExpenseFilters) => void;
}

const perPageOptions = [10, 25, 50, 100];

const sortOptions: {
  value: ExpenseSort;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  {
    value: "date",
    label: "Date",
    icon: "calendar",
  },
  {
    value: "updated_date",
    label: "Recently Updated",
    icon: "clock",
  },
  {
    value: "amount_desc",
    label: "Amount: High to Low",
    icon: "arrow-down",
  },
  {
    value: "amount_asc",
    label: "Amount: Low to High",
    icon: "arrow-up",
  },
];

const parseApiDate = (value: string | null): Date => {
  if (!value) {
    return new Date();
  }

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (value: string | null) => {
  if (!value) {
    return "Any date";
  }

  const date = parseApiDate(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ExpenseFilterModal({
  visible,
  filters,
  onClose,
  onApply,
}: ExpenseFilterModalProps) {
  const { colors } = useTheme();

  const [draft, setDraft] = useState<ExpenseFilters>(filters);

  const [datePickerType, setDatePickerType] = useState<"start" | "end" | null>(
    null
  );

  /*
   * Every time modal opens, copy the
   * currently applied filters.
   */
  useEffect(() => {
    if (visible) {
      setDraft(filters);
      setDatePickerType(null);
    }
  }, [visible, filters]);

  const setPage = (page: number) => {
    setDraft((current) => ({
      ...current,
      page: Math.max(1, page),
    }));
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setDatePickerType(null);
    }

    if (event.type === "dismissed" || !selectedDate || !datePickerType) {
      return;
    }

    const value = formatDateForApi(selectedDate);

    setDraft((current) => ({
      ...current,

      // Changing filters should usually
      // take the user back to page 1.
      page: 1,

      ...(datePickerType === "start"
        ? {
            startDate: value,
          }
        : {
            endDate: value,
          }),
    }));
  };

  const handleReset = () => {
    setDraft(defaultExpenseFilters);
  };

  const handleApply = () => {
    /*
     * Prevent invalid ranges.
     */
    if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
      return;
    }

    onApply(draft);
    onClose();
  };

  const selectedPickerDate =
    datePickerType === "start"
      ? parseApiDate(draft.startDate)
      : parseApiDate(draft.endDate);

  const invalidDateRange =
    !!draft.startDate && !!draft.endDate && draft.startDate > draft.endDate;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modal,
            {
              backgroundColor: colors.surface,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          {/* Header */}

          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Filter Expenses
            </Text>

            <Pressable hitSlop={10} onPress={onClose}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* PAGE */}

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Page
            </Text>

            <View style={styles.pageContainer}>
              <Pressable
                disabled={draft.page <= 1}
                onPress={() => setPage(draft.page - 1)}
                style={[
                  styles.pageButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                  draft.page <= 1 && styles.disabled,
                ]}
              >
                <Feather name="minus" size={20} color={colors.textPrimary} />
              </Pressable>

              <View
                style={[
                  styles.pageNumber,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pageNumberText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {draft.page}
                </Text>
              </View>

              <Pressable
                onPress={() => setPage(draft.page + 1)}
                style={[
                  styles.pageButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Feather name="plus" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* PER PAGE */}

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Expenses per page
            </Text>

            <View style={styles.rowWrap}>
              {perPageOptions.map((count) => {
                const selected = draft.perPage === count;

                return (
                  <Pressable
                    key={count}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,

                        // reset when changing
                        // page size
                        page: 1,

                        perPage: count,
                      }))
                    }
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.primary : colors.border,

                        backgroundColor: selected
                          ? `${colors.primary}15`
                          : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? colors.primary : colors.textPrimary,

                        fontWeight: selected ? "700" : "500",
                      }}
                    >
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* DATE */}

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Date Range
            </Text>

            <Text
              style={[
                styles.smallLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Start Date
            </Text>

            <View style={styles.dateRow}>
              <Pressable
                onPress={() => setDatePickerType("start")}
                style={[
                  styles.dateButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Feather
                  name="calendar"
                  size={18}
                  color={colors.textSecondary}
                />

                <Text
                  style={{
                    flex: 1,
                    color: draft.startDate
                      ? colors.textPrimary
                      : colors.textTertiary,
                  }}
                >
                  {formatDateForDisplay(draft.startDate)}
                </Text>
              </Pressable>

              {draft.startDate && (
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      page: 1,
                      startDate: null,
                    }))
                  }
                >
                  <Feather
                    name="x-circle"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>

            <Text
              style={[
                styles.smallLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              End Date
            </Text>

            <View style={styles.dateRow}>
              <Pressable
                onPress={() => setDatePickerType("end")}
                style={[
                  styles.dateButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Feather
                  name="calendar"
                  size={18}
                  color={colors.textSecondary}
                />

                <Text
                  style={{
                    flex: 1,
                    color: draft.endDate
                      ? colors.textPrimary
                      : colors.textTertiary,
                  }}
                >
                  {formatDateForDisplay(draft.endDate)}
                </Text>
              </Pressable>

              {draft.endDate && (
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      page: 1,
                      endDate: null,
                    }))
                  }
                >
                  <Feather
                    name="x-circle"
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>

            {invalidDateRange && (
              <Text
                style={{
                  color: colors.error,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                End date cannot be before start date.
              </Text>
            )}

            {datePickerType && (
              <>
                <DateTimePicker
                  value={selectedPickerDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />

                {Platform.OS === "ios" && (
                  <Pressable
                    style={styles.doneButton}
                    onPress={() => setDatePickerType(null)}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontWeight: "700",
                      }}
                    >
                      Done
                    </Text>
                  </Pressable>
                )}
              </>
            )}

            {/* CATEGORY */}

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Category
            </Text>

            <View style={styles.rowWrap}>
              <Pressable
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    page: 1,
                    category: null,
                  }))
                }
                style={[
                  styles.chip,
                  {
                    borderColor:
                      draft.category === null ? colors.primary : colors.border,

                    backgroundColor:
                      draft.category === null
                        ? `${colors.primary}15`
                        : colors.background,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      draft.category === null
                        ? colors.primary
                        : colors.textPrimary,
                  }}
                >
                  All
                </Text>
              </Pressable>

              {categories.map((category) => {
                const selected = draft.category === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        page: 1,
                        category,
                      }))
                    }
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.primary : colors.border,

                        backgroundColor: selected
                          ? `${colors.primary}15`
                          : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected ? colors.primary : colors.textPrimary,
                      }}
                    >
                      {categoryLabels[category]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* SORT */}

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Sort By
            </Text>

            <View style={styles.sortList}>
              {sortOptions.map((option) => {
                const selected = draft.sort === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        page: 1,
                        sort: option.value,
                      }))
                    }
                    style={[
                      styles.sortOption,
                      {
                        borderColor: selected ? colors.primary : colors.border,

                        backgroundColor: selected
                          ? `${colors.primary}12`
                          : colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name={option.icon}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />

                    <Text
                      style={{
                        flex: 1,

                        color: selected ? colors.primary : colors.textPrimary,

                        fontWeight: selected ? "700" : "500",
                      }}
                    >
                      {option.label}
                    </Text>

                    {selected && (
                      <Feather name="check" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}

          <View
            style={[
              styles.footer,
              {
                borderTopColor: colors.border,
              },
            ]}
          >
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontWeight: "600",
                }}
              >
                Reset
              </Text>
            </Pressable>

            <Pressable
              disabled={invalidDateRange}
              onPress={handleApply}
              style={[
                styles.applyButton,
                {
                  backgroundColor: colors.primary,
                },
                invalidDateRange && styles.disabled,
              ]}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modal: {
    width: "100%",
    maxHeight: "88%",
    borderRadius: 20,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },

  smallLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 5,
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },

  pageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pageButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  pageNumber: {
    minWidth: 70,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  pageNumberText: {
    fontSize: 17,
    fontWeight: "700",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  dateButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  doneButton: {
    alignSelf: "flex-end",
    padding: 10,
  },

  sortList: {
    gap: 8,
  },

  sortOption: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  footer: {
    borderTopWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  resetButton: {
    paddingHorizontal: 16,
    height: 48,
    justifyContent: "center",
  },

  applyButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.4,
  },
});
