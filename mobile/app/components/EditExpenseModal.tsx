// src/components/EditExpenseModal.tsx

import { useEffect, useState } from "react";
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

import { ExpenseRead, Category, ExpenseUpdate } from "@/src/types/api";
import { categories, categoryLabels } from "@/src/constants/categories";
import { useTheme } from "@/src/contexts/ThemeContext";

interface EditExpenseModalProps {
  visible: boolean;
  expense: ExpenseRead | null;

  loading?: boolean;

  onClose: () => void;

  onSave: (
    expenseId: string,
    data: ExpenseUpdate
  ) => Promise<void> | void;
}

export default function EditExpenseModal({
  visible,
  expense,
  loading = false,
  onClose,
  onSave,
}: EditExpenseModalProps) {
  const { colors } = useTheme();

  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState<Category>("other");
  const [note, setNote] = useState("");

  /**
   * Populate form whenever a different
   * expense is opened.
   */
  useEffect(() => {
    if (!expense) return;

    setAmount(String(expense.amount));
    setCategory(expense.category);
    setNote(expense.note ?? "");
  }, [expense]);

  if (!expense) {
    return null;
  }

  const handleSave = async () => {
    const parsedAmount = Number(amount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return;
    }

    await onSave(expense.id, {
      amount: parsedAmount,
      category,
      note: note.trim(),
    });
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
      {/* Clicking this area closes the modal */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      >
        {/* Prevent clicks inside modal from closing it */}
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
          onPress={(event) => {
            event.stopPropagation();
          }}
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

            <Pressable
              onPress={onClose}
              hitSlop={10}
            >
              <Feather
                name="x"
                size={22}
                color={colors.textSecondary}
              />
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
                  color: colors.textSecondary,
                },
              ]}
            >
              Amount
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!loading}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

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
                const selected =
                  category === cat;

                return (
                  <Pressable
                    key={cat}
                    disabled={loading}
                    onPress={() =>
                      setCategory(cat)
                    }
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
              editable={!loading}
              placeholder="Add a note..."
              placeholderTextColor={
                colors.textTertiary
              }
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

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
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={loading}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                  loading &&
                    styles.disabledButton,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save Changes
                  </Text>
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
    marginBottom: 18,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },

  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
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
    opacity: 0.6,
  },
  keyboardAvoidingView: {
  flex: 1,
},
});