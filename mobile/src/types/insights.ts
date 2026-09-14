import type {
  Category,
  ExpenseRead,
} from "@/src/types/api";

export interface CategoryInsight {
  category: Category;

  total: number;
  previousTotal: number;

  percentage: number;

  changeAmount: number;
  changePercent: number | null;
}

export interface HighestSpendingDay {
  date: string;
  total: number;
  count: number;
}

export interface InsightsData {
  isLoading: boolean;

  currency: string;

  currentMonthName: string;
  previousMonthName: string;

  currentTotal: number;
  previousTotal: number;

  monthChangePercent: number | null;

  averageDailySpend: number;
  projectedMonthSpend: number;

  categoryData: CategoryInsight[];

  topCategory: CategoryInsight | null;

  largestExpense: ExpenseRead | null;

  highestSpendingDay: HighestSpendingDay | null;
}