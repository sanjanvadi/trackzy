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
  categoryLabels,
} from "@/src/constants/categories";

import { useTheme } from "@/src/contexts/ThemeContext";

import { formatCurrency } from "@/src/utils/currency";

import type {
  CategoryInsight,
} from "@/src/types/insights";

interface Props {
  categories:
    CategoryInsight[];

  currency: string;

  previousMonthName: string;
}

const SUCCESS_COLOR =
  "#16A34A";

export default function CategoryBreakdownCard({
  categories,
  currency,
  previousMonthName,
}: Props) {
  const { colors } =
    useTheme();

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
      <View
        style={
          styles.header
        }
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
          Spending by Category
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Compared with{" "}
          {previousMonthName}
        </Text>
      </View>

      {categories.length ===
      0 ? (
        <View
          style={
            styles.empty
          }
        >
          <Feather
            name="pie-chart"
            size={44}
            color={
              colors.textTertiary
            }
          />

          <Text
            style={[
              styles.emptyText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            No spending data
          </Text>
        </View>
      ) : (
        categories.map(
          (
            item,
            index
          ) => {
            const increased =
              item.changeAmount >
              0;

            const decreased =
              item.changeAmount <
              0;

            const categoryColor =
              categoryColors[
                item.category
              ] ||
              colors.primary;

            const label =
              categoryLabels[
                item.category
              ] ||
              item.category;

            const progressWidth =
              `${Math.min(
                Math.max(
                  item.percentage,
                  0
                ),
                100
              )}%` as `${number}%`;

            return (
              <View
                key={
                  item.category
                }
                style={[
                  styles.categoryItem,

                  index !==
                    categories.length -
                      1 && {
                    borderBottomWidth:
                      1,

                    borderBottomColor:
                      colors.border,
                  },
                ]}
              >
                <View
                  style={
                    styles.row
                  }
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          categoryColor,
                      },
                    ]}
                  />

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color:
                            colors.textPrimary,
                        },
                      ]}
                    >
                      {label}
                    </Text>

                    <Text
                      style={[
                        styles.percentage,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {item.percentage.toFixed(
                        0
                      )}
                      % of total
                    </Text>
                  </View>

                  <View
                    style={
                      styles.right
                    }
                  >
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
                        item.total,
                        currency
                      )}
                    </Text>

                    {item.changePercent !==
                    null ? (
                      <View
                        style={
                          styles.change
                        }
                      >
                        <Feather
                          name={
                            increased
                              ? "arrow-up"
                              : decreased
                                ? "arrow-down"
                                : "minus"
                          }
                          size={12}
                          color={
                            increased
                              ? colors.error
                              : decreased
                                ? SUCCESS_COLOR
                                : colors.textSecondary
                          }
                        />

                        <Text
                          style={[
                            styles.changeText,
                            {
                              color:
                                increased
                                  ? colors.error
                                  : decreased
                                    ? SUCCESS_COLOR
                                    : colors.textSecondary,
                            },
                          ]}
                        >
                          {Math.abs(
                            item.changePercent
                          ).toFixed(
                            0
                          )}
                          %
                        </Text>
                      </View>
                    ) : item.total >
                        0 &&
                      item.previousTotal ===
                        0 ? (
                      <Text
                        style={[
                          styles.newText,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        New
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View
                  style={[
                    styles.progressTrack,
                    {
                      backgroundColor:
                        colors.background,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.progress,
                      {
                        width:
                          progressWidth,

                        backgroundColor:
                          categoryColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          }
        )
      )}
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

    header: {
      marginBottom:
        SPACING.md,
    },

    title: {
      fontSize:
        TYPOGRAPHY.fontSize.h3,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
    },

    subtitle: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      marginTop: 3,
    },

    categoryItem: {
      paddingVertical:
        SPACING.md,
    },

    row: {
      flexDirection: "row",

      alignItems: "center",

      gap: SPACING.sm,
    },

    dot: {
      width: 14,
      height: 14,

      borderRadius: 7,
    },

    categoryLabel: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    percentage: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      marginTop: 2,
    },

    right: {
      alignItems:
        "flex-end",
    },

    amount: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
    },

    change: {
      flexDirection: "row",

      alignItems: "center",

      gap: 2,

      marginTop: 3,
    },

    changeText: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    newText: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,

      marginTop: 3,
    },

    progressTrack: {
      height: 5,

      borderRadius: 3,

      overflow: "hidden",

      marginTop: 10,
    },

    progress: {
      height: "100%",

      borderRadius: 3,
    },

    empty: {
      alignItems: "center",

      paddingVertical:
        SPACING.xxl,
    },

    emptyText: {
      marginTop:
        SPACING.md,

      fontSize:
        TYPOGRAPHY.fontSize.body,
    },
  });