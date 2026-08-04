// React Query hooks for expenses

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  getExpenseSummary,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/src/services/expense.service';
import { queryKeys } from '@/src/config/queryClient';
import {
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseListParams,
  ExpenseSummaryParams,
} from '@/src/types/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Get expenses for a ledger
 */
export const useExpenses = (ledgerId: string, params?: ExpenseListParams) => {
  const { user, initializing } = useAuth();
  return useQuery({
    queryKey: queryKeys.expenses.list(ledgerId, params),
    queryFn: () => getExpenses(ledgerId, params),
    enabled: !!user && !initializing && !!ledgerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
  });
};

/**
 * Get expense summary
 */
export const useExpenseSummary = (
  ledgerId: string,
  params?: ExpenseSummaryParams
) => {
  const { user, initializing } = useAuth();
  return useQuery({
    queryKey: queryKeys.expenses.summary(ledgerId, params),
    queryFn: () => getExpenseSummary(ledgerId, params),
    enabled: !!user && !initializing && !!ledgerId,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};

/**
 * Get single expense
 */
export const useExpense = (ledgerId: string, expenseId: string) => {
  const { user, initializing } = useAuth();
  return useQuery({
    queryKey: queryKeys.expenses.detail(ledgerId, expenseId),
    queryFn: () => getExpense(ledgerId, expenseId),
    enabled: !!user && !initializing && !!ledgerId && !!expenseId,
    retry: false,
  });
};

/**
 * Create expense mutation
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ledgerId, data }: { ledgerId: string; data: ExpenseCreate }) =>
      createExpense(ledgerId, data),
    onSuccess: (_, variables) => {
      // Invalidate expenses list and summary for this ledger
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.summaries(),
      });
    },
  });
};

/**
 * Update expense mutation
 */
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ledgerId,
      expenseId,
      data,
    }: {
      ledgerId: string;
      expenseId: string;
      data: ExpenseUpdate;
    }) => updateExpense(ledgerId, expenseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.summaries(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.detail(variables.ledgerId, variables.expenseId),
      });
    },
  });
};

/**
 * Delete expense mutation
 */
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ledgerId, expenseId }: { ledgerId: string; expenseId: string }) =>
      deleteExpense(ledgerId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.summaries(),
      });
    },
  });
};
