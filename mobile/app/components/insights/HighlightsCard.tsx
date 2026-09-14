import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import {
  BORDER_RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/src/constants/theme";

import {
  categoryColors,
  categoryIconNames,
  categoryLabels,
} from "@/src/constants/categories";

import { useTheme } from "@/src/contexts/ThemeContext";

import { formatCurrency } from "@/src/utils/currency";

import {
  formatFullDate,
  formatShortDate,
} from "@/src/utils/insights";

import type {
  CategoryInsight,
  HighestSpendingDay,
} from "@/src/types/insights";

import type {
  ExpenseRead,
} from "@/src/types/api";

interface Props {
  topCategory:
    CategoryInsight | null;

  largestExpense:
    ExpenseRead | null;

  highestSpendingDay:
    HighestSpendingDay | null;

  currency: string;
}

export default function HighlightsCard({
  topCategory,
  largestExpense,
  highestSpendingDay,
  currency,
}: Props) {
  const { colors } =
    useTheme();

  const topCategoryLabel =
    topCategory
      ? categoryLabels[
          topCategory.category
        ]
      : null;

  const topCategoryColor =
    topCategory
      ? categoryColors[
          topCategory.category
        ]
      : colors.primary;

  const topCategoryIcon =
    topCategory
      ? categoryIconNames[
          topCategory.category
        ]
      : "pie-chart";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            colors.surface,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Highlights
      </Text>

      {/* Top Category */}

      <View
        style={[
          styles.row,
          {
            borderBottomColor:
              colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.icon,
            {
              backgroundColor:
                `${topCategoryColor}18`,
            },
          ]}
        >
          <Feather
            name={
              topCategoryIcon as any
            }
            size={21}
            color={
              topCategoryColor
            }
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            TOP CATEGORY
          </Text>

          <Text
            style={[
              styles.rowTitle,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {topCategoryLabel ||
              "No data"}
          </Text>

          {topCategory && (
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {topCategory.percentage.toFixed(
                0
              )}
              % of monthly
              spending
            </Text>
          )}
        </View>

        {topCategory && (
          <Text
            style={[
              styles.amount,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {formatCurrency(
              topCategory.total,
              currency
            )}
          </Text>
        )}
      </View>

      {/* Largest Expense */}

      <View
        style={[
          styles.row,
          {
            borderBottomColor:
              colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.icon,
            {
              backgroundColor:
                `${colors.primary}15`,
            },
          ]}
        >
          <Feather
            name="award"
            size={21}
            color={
              colors.primary
            }
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            LARGEST EXPENSE
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.rowTitle,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {largestExpense
              ? largestExpense.note ||
                categoryLabels[
                  largestExpense.category
                ]
              : "No expenses"}
          </Text>

          {largestExpense && (
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {
                categoryLabels[
                  largestExpense.category
                ]
              }{" "}
              •{" "}
              {formatShortDate(
                largestExpense.date
              )}
            </Text>
          )}
        </View>

        {largestExpense && (
          <Text
            style={[
              styles.amount,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {formatCurrency(
              Number(
                largestExpense.amount
              ),
              currency
            )}
          </Text>
        )}
      </View>

      {/* Highest Spending Day */}

      <View
        style={[
          styles.row,
          styles.lastRow,
        ]}
      >
        <View
          style={[
            styles.icon,
            {
              backgroundColor:
                `${colors.primary}15`,
            },
          ]}
        >
          <Feather
            name="calendar"
            size={21}
            color={
              colors.primary
            }
          />
        </View>

        <View
          style={
            styles.content
          }
        >
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            HIGHEST SPENDING DAY
          </Text>

          <Text
            style={[
              styles.rowTitle,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {highestSpendingDay
              ? formatFullDate(
                  highestSpendingDay.date
                )
              : "No expenses"}
          </Text>

          {highestSpendingDay && (
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {
                highestSpendingDay.count
              }{" "}
              {highestSpendingDay.count ===
              1
                ? "transaction"
                : "transactions"}
            </Text>
          )}
        </View>

        {highestSpendingDay && (
          <Text
            style={[
              styles.amount,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {formatCurrency(
              highestSpendingDay.total,
              currency
            )}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      borderRadius:
        BORDER_RADIUS.xl,

      padding:
        SPACING.lg,

      marginBottom:
        SPACING.lg,

      ...SHADOWS.sm,
    },

    title: {
      fontSize:
        TYPOGRAPHY.fontSize.h3,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,

      marginBottom:
        SPACING.sm,
    },

    row: {
      flexDirection: "row",

      alignItems: "center",

      paddingVertical:
        SPACING.lg,

      borderBottomWidth: 1,

      gap: SPACING.md,
    },

    lastRow: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },

    icon: {
      width: 44,
      height: 44,

      borderRadius: 22,

      alignItems: "center",
      justifyContent:
        "center",
    },

    content: {
      flex: 1,
    },

    label: {
      fontSize: 10,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,

      letterSpacing: 0.7,

      marginBottom: 3,
    },

    rowTitle: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    subtitle: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      marginTop: 2,
    },

    amount: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,

      maxWidth: 100,

      textAlign: "right",
    },
  });