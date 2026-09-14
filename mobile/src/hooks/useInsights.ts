import { useMemo } from "react";

import {
  useExpenses,
  useExpenseSummary,
} from "@/src/hooks/useExpenses";

import type {
  Category,
  ExpenseRead,
} from "@/src/types/api";

import type {
  CategoryInsight,
  HighestSpendingDay,
  InsightsData,
} from "@/src/types/insights";

import {
  calculatePercentageChange,
  formatDateForApi,
  getMonthName,
} from "@/src/utils/insights";

export const useInsights = (
  ledgerId: string
): InsightsData => {
  /* -------------------------------- */
  /* Dates                            */
  /* -------------------------------- */

  const today = new Date();

  const currentYear =
    today.getFullYear();

  const currentMonth =
    today.getMonth();

  const currentMonthName =
    getMonthName(today);

  const previousMonthDate =
    new Date(
      currentYear,
      currentMonth - 1,
      1
    );

  const previousMonthName =
    getMonthName(
      previousMonthDate
    );

  const currentMonthStart =
    new Date(
      currentYear,
      currentMonth,
      1
    );

  const currentMonthEnd =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    );

  const daysElapsed =
    today.getDate();

  const daysInCurrentMonth =
    currentMonthEnd.getDate();

  /* -------------------------------- */
  /* API                              */
  /* -------------------------------- */

  const {
    data: currentSummary,
    isLoading:
      isCurrentSummaryLoading,
  } = useExpenseSummary(
    ledgerId,
    {
      period: "this_month",
    }
  );

  const {
    data: previousSummary,
    isLoading:
      isPreviousSummaryLoading,
  } = useExpenseSummary(
    ledgerId,
    {
      period: "last_month",
    }
  );

  /*
   * Needed for:
   *
   * - largest expense
   * - highest spending day
   *
   * If monthly transaction counts can
   * exceed 100, these calculations
   * should eventually move backend-side.
   */
  const {
    data: currentMonthExpenses,
    isLoading:
      areExpensesLoading,
  } = useExpenses(
    ledgerId,
    {
      page: 1,

      per_page: 100,

      start_date:
        formatDateForApi(
          currentMonthStart
        ),

      end_date:
        formatDateForApi(
          currentMonthEnd
        ),

      sorting: "date",
    }
  );

  /* -------------------------------- */
  /* Basic totals                     */
  /* -------------------------------- */

  const currentTotal =
    Number(
      currentSummary?.total ?? 0
    );

  const previousTotal =
    Number(
      previousSummary?.total ?? 0
    );

  const currency =
    currentSummary?.currency ||
    previousSummary?.currency ||
    "USD";

  const monthChangePercent =
    calculatePercentageChange(
      currentTotal,
      previousTotal
    );

  /* -------------------------------- */
  /* Daily average                    */
  /* -------------------------------- */

  const averageDailySpend =
    daysElapsed > 0
      ? currentTotal /
        daysElapsed
      : 0;

  /* -------------------------------- */
  /* Projection                       */
  /* -------------------------------- */

  const projectedMonthSpend =
    averageDailySpend *
    daysInCurrentMonth;

  /* -------------------------------- */
  /* Categories                       */
  /* -------------------------------- */

  const categoryData =
    useMemo<
      CategoryInsight[]
    >(() => {
      const currentMap =
        new Map<
          Category,
          number
        >();

      const previousMap =
        new Map<
          Category,
          number
        >();

      (
        currentSummary
          ?.breakdown ?? []
      ).forEach((item) => {
        currentMap.set(
          item.category as Category,
          Number(item.total)
        );
      });

      (
        previousSummary
          ?.breakdown ?? []
      ).forEach((item) => {
        previousMap.set(
          item.category as Category,
          Number(item.total)
        );
      });

      /*
       * Union allows us to show categories
       * that existed last month but have
       * $0 spending this month.
       */
      const categories =
        new Set<Category>([
          ...currentMap.keys(),
          ...previousMap.keys(),
        ]);

      return Array.from(
        categories
      )
        .map(
          (
            category
          ): CategoryInsight => {
            const total =
              currentMap.get(
                category
              ) ?? 0;

            const previousTotal =
              previousMap.get(
                category
              ) ?? 0;

            const changeAmount =
              total -
              previousTotal;

            const changePercent =
              calculatePercentageChange(
                total,
                previousTotal
              );

            const percentage =
              currentTotal > 0
                ? (total /
                    currentTotal) *
                  100
                : 0;

            return {
              category,

              total,
              previousTotal,

              percentage,

              changeAmount,
              changePercent,
            };
          }
        )
        .sort(
          (a, b) =>
            b.total -
            a.total
        );
    }, [
      currentSummary,
      previousSummary,
      currentTotal,
    ]);

  /* -------------------------------- */
  /* Top category                     */
  /* -------------------------------- */

  const topCategory =
    useMemo(() => {
      return (
        categoryData.find(
          (item) =>
            item.total > 0
        ) ?? null
      );
    }, [categoryData]);

  /* -------------------------------- */
  /* Largest expense                  */
  /* -------------------------------- */

  const largestExpense =
    useMemo<
      ExpenseRead | null
    >(() => {
      if (
        !currentMonthExpenses ||
        currentMonthExpenses.length ===
          0
      ) {
        return null;
      }

      return currentMonthExpenses.reduce<
        ExpenseRead | null
      >(
        (
          largest,
          expense
        ) => {
          if (!largest) {
            return expense;
          }

          return Number(
            expense.amount
          ) >
            Number(
              largest.amount
            )
            ? expense
            : largest;
        },
        null
      );
    }, [
      currentMonthExpenses,
    ]);

  /* -------------------------------- */
  /* Highest-spending day             */
  /* -------------------------------- */

  const highestSpendingDay =
    useMemo<
      HighestSpendingDay | null
    >(() => {
      if (
        !currentMonthExpenses ||
        currentMonthExpenses.length ===
          0
      ) {
        return null;
      }

      const dayMap =
        new Map<
          string,
          {
            total: number;
            count: number;
          }
        >();

      currentMonthExpenses.forEach(
        (expense) => {
          const previous =
            dayMap.get(
              expense.date
            ) ?? {
              total: 0,
              count: 0,
            };

          dayMap.set(
            expense.date,
            {
              total:
                previous.total +
                Number(
                  expense.amount
                ),

              count:
                previous.count +
                1,
            }
          );
        }
      );

      const days:
        HighestSpendingDay[] =
        Array.from(
          dayMap.entries()
        ).map(
          ([
            date,
            value,
          ]) => ({
            date,
            total:
              value.total,
            count:
              value.count,
          })
        );

      return days.reduce<
        HighestSpendingDay | null
      >(
        (
          highest,
          day
        ) => {
          if (!highest) {
            return day;
          }

          return day.total >
            highest.total
            ? day
            : highest;
        },
        null
      );
    }, [
      currentMonthExpenses,
    ]);

  /* -------------------------------- */
  /* Loading                          */
  /* -------------------------------- */

  const isLoading =
    isCurrentSummaryLoading ||
    isPreviousSummaryLoading ||
    areExpensesLoading;

  return {
    isLoading,

    currency,

    currentMonthName,
    previousMonthName,

    currentTotal,
    previousTotal,

    monthChangePercent,

    averageDailySpend,
    projectedMonthSpend,

    categoryData,

    topCategory,

    largestExpense,

    highestSpendingDay,
  };
};