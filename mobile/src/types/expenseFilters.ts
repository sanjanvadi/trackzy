import { Category } from "@/src/types/api";

export type ExpenseSort =
  | "date"
  | "updatedDate"
  | "amountDesc"
  | "amountInc";

export interface ExpenseFilters {
  page: number;
  perPage: number;

  startDate: string | null;
  endDate: string | null;

  category: Category | null;

  sort: ExpenseSort;
}

export const defaultExpenseFilters: ExpenseFilters = {
  page: 1,
  perPage: 50,

  startDate: null,
  endDate: null,

  category: null,

  sort: "date",
};