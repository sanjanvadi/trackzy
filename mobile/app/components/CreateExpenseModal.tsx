// src/components/CreateExpenseModal.tsx

import { useMemo, useState } from "react";
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
  Alert,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/src/contexts/ThemeContext";
import { useLedger } from "@/src/contexts/LedgerContext";
import { useCreateExpense } from "@/src/hooks/useExpenses";

import { Category } from "@/src/types/api";

import { categories, categoryLabels } from "@/src/constants/categories";

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from "@/src/constants/theme";

interface CreateExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

const getTodayDate = (): Date => {
  return new Date();
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CreateExpenseModal({
  visible,
  onClose,
}: CreateExpenseModalProps) {
  const { colors, isDark } = useTheme();
  const { selectedLedger } = useLedger();

  const createExpenseMutation = useCreateExpense();

  const [amount, setAmount] = useState("");

  const [category, setCategory] = useState<Category | null>(null);

  const [note, setNote] = useState("");

  const [date, setDate] = useState<Date>(getTodayDate());

  const [showDatePicker, setShowDatePicker] = useState(false);

  const isFormValid = useMemo(() => {
    const parsedAmount = Number(amount);

    return (
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      category !== null &&
      note.trim().length > 0
    );
  }, [amount, category, note]);

  const resetForm = () => {
    setAmount("");
    setCategory(null);
    setNote("");
    setDate(getTodayDate());
    setShowDatePicker(false);
  };

  const handleClose = () => {
    if (createExpenseMutation.isPending) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreate = async () => {
    if (!selectedLedger) {
      Alert.alert("No Ledger", "Please select a ledger first.");

      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");

      return;
    }

    if (!category) {
      Alert.alert("Category Required", "Please select a category.");

      return;
    }

    const trimmedNote = note.trim();

    if (!trimmedNote) {
      Alert.alert("Description Required", "Please enter a description.");

      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        ledgerId: selectedLedger.id,

        data: {
          amount: parsedAmount,
          category,
          note: trimmedNote,
          date: formatDateForApi(date),
          source: "manual",
        },
      });

      resetForm();
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Unable to create expense",
        error.response?.data?.detail || error.message || "Please try again."
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
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
                Add Expense
              </Text>

              <Pressable
                onPress={handleClose}
                hitSlop={10}
                disabled={createExpenseMutation.isPending}
              >
                <Feather name="x" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Amount */}

              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Amount
              </Text>

              <View
                style={[
                  styles.amountContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  $
                </Text>

                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  editable={!createExpenseMutation.isPending}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.amountInput,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>

              {/* Category */}

              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Category
              </Text>

              <View style={styles.categoryContainer}>
                {categories.map((cat) => {
                  const selected = category === cat;

                  return (
                    <Pressable
                      key={cat}
                      disabled={createExpenseMutation.isPending}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        {
                          borderColor: selected
                            ? colors.primary
                            : colors.border,

                          backgroundColor: selected
                            ? isDark
                              ? "rgba(59, 130, 246, 0.15)"
                              : "#DBEAFE"
                            : colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color: selected
                              ? colors.primary
                              : colors.textPrimary,
                          },
                        ]}
                      >
                        {categoryLabels[cat]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Description */}

              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Description
              </Text>

              <TextInput
                value={note}
                onChangeText={setNote}
                editable={!createExpenseMutation.isPending}
                placeholder="e.g. Lunch"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                maxLength={200}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              {/* Date */}

              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Date
              </Text>

              <Pressable
                disabled={createExpenseMutation.isPending}
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.dateSelector,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.dateLeft}>
                  <Feather name="calendar" size={20} color={colors.primary} />

                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {formatDateForDisplay(date)}
                  </Text>
                </View>

                <Feather
                  name="chevron-down"
                  size={20}
                  color={colors.textTertiary}
                />
              </Pressable>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                    themeVariant={isDark ? "dark" : "light"}
                  />

                  {Platform.OS === "ios" && (
                    <Pressable
                      style={[
                        styles.dateDoneButton,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.dateDoneText}>Done</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Actions */}

              <View style={styles.actions}>
                <Pressable
                  onPress={handleClose}
                  disabled={createExpenseMutation.isPending}
                  style={[
                    styles.cancelButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
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
                  onPress={handleCreate}
                  disabled={createExpenseMutation.isPending || !isFormValid}
                  style={[
                    styles.createButton,
                    {
                      backgroundColor: colors.primary,
                    },
                    (createExpenseMutation.isPending || !isFormValid) &&
                      styles.disabledButton,
                  ]}
                >
                  {createExpenseMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.createButtonText}>Add Expense</Text>
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
    maxHeight: "90%",
    borderRadius: 18,
    padding: 20,
  },

  scrollContent: {
    paddingBottom: 4,
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

  amountContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  currencySymbol: {
    fontSize: 22,
    fontWeight: "700",
    marginRight: 6,
  },

  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },

  categoryChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },

  dateSelector: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },

  datePickerContainer: {
    marginBottom: 18,
  },

  dateDoneButton: {
    alignSelf: "flex-end",
    minWidth: 80,
    minHeight: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  dateDoneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },

  createButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.45,
  },
});
