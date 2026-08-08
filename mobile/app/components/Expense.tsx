import { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";

import { Feather } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "@/src/constants/theme";

import { formatCurrency } from "@/src/utils/currency";
import { getRelativeTime } from "@/src/utils/date";

import {
  categoryIconNames,
  categoryColors,
  categoryBackgroundColors,
} from "@/src/constants/categories";

import { Category, ExpenseRead } from "@/src/types/api";

import { useDeleteExpense, useUpdateExpense } from "@/src/hooks/useExpenses";

import { useLedger } from "@/src/contexts/LedgerContext";
import EditExpenseModal from "./EditExpenseModal";
import ConfirmModal from "./ConfirmModal";

const getCategoryIcon = (category: Category): string => {
  return categoryIconNames[category] || "package";
};

interface ExpenseRowProps {
  expense: ExpenseRead;
  currency: string;
  openSwipeableRef: React.MutableRefObject<any>;
}

export default function ExpenseRow({
  expense,
  currency,
  openSwipeableRef,
}: ExpenseRowProps) {
  const { selectedLedger } = useLedger();

  const swipeableRef = useRef<Swipeable>(null);

  const [editingExpense, setEditingExpense] = useState<ExpenseRead | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRead | null>(null);

  const deleteExpenseMutation = useDeleteExpense();
  const updateExpenseMutation = useUpdateExpense();

  const iconName = getCategoryIcon(expense.category);

  const bgColor = categoryBackgroundColors[expense.category];

  const iconColor = categoryColors[expense.category];

  const handleEdit = () => {
    swipeableRef.current?.close();

    setEditingExpense(expense);
  };

  const handleDelete = () => {
    if (!selectedLedger) {
      return;
    }

    swipeableRef.current?.close();

    if (openSwipeableRef.current == swipeableRef.current) {
        openSwipeableRef.current = null;
    }

    setDeletingExpense(expense);
  };

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

  const renderLeftActions = () => (
    <Pressable style={styles.editSwipeAction} onPress={handleEdit}>
      <Feather name="edit-2" size={22} color="#FFFFFF" />

      <Text style={styles.swipeActionText}>Edit</Text>
    </Pressable>
  );

  const renderRightActions = () => (
    <Pressable style={styles.deleteSwipeAction} onPress={handleDelete}>
      <Feather name="trash-2" size={22} color="#FFFFFF" />

      <Text style={styles.swipeActionText}>Delete</Text>
    </Pressable>
  );

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
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
        <View style={styles.transactionItem}>
          <View
            style={[
              styles.transactionIcon,
              {
                backgroundColor: bgColor,
              },
            ]}
          >
            <Feather name={iconName as any} size={24} color={iconColor} />
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.transactionName}>
              {expense.note ||
                expense.category.charAt(0).toUpperCase() +
                  expense.category.slice(1)}
            </Text>

            <Text style={styles.transactionDate}>
              {getRelativeTime(expense.created_at)}
            </Text>
          </View>

          <Text style={[styles.transactionAmount, styles.amountNegative]}>
            -{formatCurrency(expense.amount, currency || "USD")}
          </Text>
        </View>
      </Swipeable>

      <EditExpenseModal
        visible={!!editingExpense}
        expense={editingExpense}
        loading={updateExpenseMutation.isPending}
        onClose={() => setEditingExpense(null)}
        onSave={async (expenseId, data) => {
          if (!selectedLedger) {
            return;
          }

          try {
            await updateExpenseMutation.mutateAsync({
              ledgerId: selectedLedger.id,
              expenseId,
              data,
            });

            setEditingExpense(null);
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.detail ||
                error.message ||
                "Failed to update expense"
            );
          }
        }}
      />

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
    </>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },

  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
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

  amountNegative: {
    color: COLORS.textPrimary,
  },

  editSwipeAction: {
    width: 90,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
  },

  deleteSwipeAction: {
    width: 90,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
  },

  swipeActionText: {
    color: "#FFFFFF",
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: 4,
  },
});
