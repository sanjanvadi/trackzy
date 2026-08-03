// Expense Service - API calls for expenses

import apiClient, { endpoints } from '@/src/config/api';
import {
  ExpenseRead,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseListParams,
  ExpenseSummary,
  ExpenseSummaryParams,
} from '@/src/types/api';

/**
 * Get expenses for a ledger
 */
export const getExpenses = async (
  ledgerId: string,
  params?: ExpenseListParams
): Promise<ExpenseRead[]> => {
  const response = await apiClient.get<ExpenseRead[]>(
    endpoints.expenses.list(ledgerId),
    { params }
  );
  return response.data;
};

/**
 * Get expense summary for a ledger
 */
export const getExpenseSummary = async (
  ledgerId: string,
  params?: ExpenseSummaryParams
): Promise<ExpenseSummary> => {
  const response = await apiClient.get<ExpenseSummary>(
    endpoints.expenses.summary(ledgerId),
    { params }
  );
  return response.data;
};

/**
 * Get a single expense
 */
export const getExpense = async (
  ledgerId: string,
  expenseId: string
): Promise<ExpenseRead> => {
  const response = await apiClient.get<ExpenseRead>(
    endpoints.expenses.get(ledgerId, expenseId)
  );
  return response.data;
};

/**
 * Create a new expense
 */
export const createExpense = async (
  ledgerId: string,
  data: ExpenseCreate
): Promise<ExpenseRead> => {
  const response = await apiClient.post<ExpenseRead>(
    endpoints.expenses.create(ledgerId),
    data
  );
  return response.data;
};

/**
 * Update an expense
 */
export const updateExpense = async (
  ledgerId: string,
  expenseId: string,
  data: ExpenseUpdate
): Promise<ExpenseRead> => {
  const response = await apiClient.patch<ExpenseRead>(
    endpoints.expenses.update(ledgerId, expenseId),
    data
  );
  return response.data;
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  ledgerId: string,
  expenseId: string
): Promise<void> => {
  await apiClient.delete(endpoints.expenses.delete(ledgerId, expenseId));
};
