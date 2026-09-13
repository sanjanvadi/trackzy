// src/components/EditExpenseModal.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ExpenseRead, Category, ExpenseUpdate } from "@/src/types/api";

import { categories, categoryLabels } from "@/src/constants/categories";

import { useTheme } from "@/src/contexts/ThemeContext";

interface EditExpenseModalProps {
  visible: boolean;
  expense: ExpenseRead | null;
  loading?: boolean;
  onClose: () => void;

  onSave: (expenseId: string, data: ExpenseUpdate) => Promise<void> | void;
}

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const parseApiDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

export default function EditExpenseModal({
  visible,
  expense,
  loading = false,
  onClose,
  onSave,
}: EditExpenseModalProps) {
  const { colors } = useTheme();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category | null>(null);

  const [note, setNote] = useState("");

  const [date, setDate] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!expense) {
      return;
    }

    setAmount(String(expense.amount));

    setCategory(expense.category);

    setNote(expense.note ?? "");

    setDate(parseApiDate(expense.date) ?? new Date());

    setSubmitted(false);
    setShowDatePicker(false);
  }, [expense]);

  const parsedAmount = Number(amount);

  const amountValid =
    amount.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  const categoryValid = category !== null;

  const noteValid = note.trim().length > 0;

  const dateValid = date !== null;

  const isFormValid = amountValid && categoryValid && noteValid && dateValid;

  const errors = useMemo(
    () => ({
      amount: submitted && !amountValid,

      category: submitted && !categoryValid,

      note: submitted && !noteValid,

      date: submitted && !dateValid,
    }),
    [submitted, amountValid, categoryValid, noteValid, dateValid]
  );

  if (!expense) {
    return null;
  }

  const handleSave = async () => {
    setSubmitted(true);

    if (!isFormValid) {
      return;
    }

    await onSave(expense.id, {
      amount: parsedAmount,
      category: category!,
      note: note.trim(),
      date: formatDateForApi(date!),
    });
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Edit Expense
              </Text>

              <Pressable onPress={onClose} hitSlop={10} disabled={loading}>
                <Feather name="x" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Amount */}

              <Text
                style={[
                  styles.label,
                  {
                    color: errors.amount ? colors.error : colors.textSecondary,
                  },
                ]}
              >
                Amount *
              </Text>

              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!loading}
                placeholder="Enter amount"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,

                    borderColor: errors.amount ? colors.error : colors.border,

                    color: colors.textPrimary,
                  },
                ]}
              />

              {errors.amount && (
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: colors.error,
                    },
                  ]}
                >
                  Enter a valid amount.
                </Text>
              )}

              {/* Category */}

              <Text
                style={[
                  styles.label,
                  {
                    color: errors.category
                      ? colors.error
                      : colors.textSecondary,
                  },
                ]}
              >
                Category *
              </Text>

              <View
                style={[
                  styles.categoryWrapper,

                  errors.category && {
                    borderColor: colors.error,
                  },
                ]}
              >
                <View style={styles.categoryContainer}>
                  {categories.map((cat) => {
                    const selected = category === cat;

                    return (
                      <Pressable
                        key={cat}
                        disabled={loading}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryChip,
                          {
                            borderColor: selected
                              ? colors.primary
                              : colors.border,

                            backgroundColor: selected
                              ? `${colors.primary}15`
                              : colors.background,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected
                              ? colors.primary
                              : colors.textPrimary,
                          }}
                        >
                          {categoryLabels[cat]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {errors.category && (
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: colors.error,
                    },
                  ]}
                >
                  Select a category.
                </Text>
              )}

              {/* Description */}

              <Text
                style={[
                  styles.label,
                  {
                    color: errors.note ? colors.error : colors.textSecondary,
                  },
                ]}
              >
                Description *
              </Text>

              <TextInput
                value={note}
                onChangeText={setNote}
                editable={!loading}
                placeholder="Add a note..."
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,

                    borderColor: errors.note ? colors.error : colors.border,

                    color: colors.textPrimary,
                  },
                ]}
              />

              {errors.note && (
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: colors.error,
                    },
                  ]}
                >
                  Description is required.
                </Text>
              )}

              {/* Date */}

              <Text
                style={[
                  styles.label,
                  {
                    color: errors.date ? colors.error : colors.textSecondary,
                  },
                ]}
              >
                Date *
              </Text>

              <Pressable
                disabled={loading}
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.dateInput,
                  {
                    backgroundColor: colors.background,

                    borderColor: errors.date ? colors.error : colors.border,
                  },
                ]}
              >
                <Feather
                  name="calendar"
                  size={20}
                  color={errors.date ? colors.error : colors.textSecondary}
                />

                <Text
                  style={{
                    flex: 1,

                    color: date ? colors.textPrimary : colors.textTertiary,
                  }}
                >
                  {date ? formatDateForDisplay(date) : "Select date"}
                </Text>
              </Pressable>

              {errors.date && (
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: colors.error,
                    },
                  ]}
                >
                  Date is required.
                </Text>
              )}

              {showDatePicker && (
                <View>
                  <DateTimePicker
                    value={date ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />

                  {Platform.OS === "ios" && (
                    <Pressable
                      style={styles.dateDoneButton}
                      onPress={() => setShowDatePicker(false)}
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
                </View>
              )}

              {/* Buttons */}

              <View style={styles.actions}>
                <Pressable
                  onPress={onClose}
                  disabled={loading}
                  style={styles.cancelButton}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  disabled={loading || !isFormValid}
                  style={[
                    styles.saveButton,
                    {
                      backgroundColor: colors.primary,
                    },

                    (loading || !isFormValid) && styles.disabledButton,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },

  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalCard: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 18,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  errorText: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 12,
  },

  categoryWrapper: {
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 12,
    padding: 4,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },

  dateInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dateDoneButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },

  cancelButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },

  saveButton: {
    minWidth: 120,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.45,
  },
});
