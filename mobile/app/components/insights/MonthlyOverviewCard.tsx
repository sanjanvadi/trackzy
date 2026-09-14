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

import { useTheme } from "@/src/contexts/ThemeContext";

import { formatCurrency } from "@/src/utils/currency";

interface Props {
  currentMonthName: string;
  previousMonthName: string;

  currentTotal: number;
  previousTotal: number;

  changePercent: number | null;

  currency: string;
}

const SUCCESS_COLOR =
  "#16A34A";

export default function MonthlyOverviewCard({
  currentMonthName,
  previousMonthName,

  currentTotal,
  previousTotal,

  changePercent,

  currency,
}: Props) {
  const { colors } =
    useTheme();

  const increased =
    changePercent !== null &&
    changePercent > 0;

  const decreased =
    changePercent !== null &&
    changePercent < 0;

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
          styles.label,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        {currentMonthName.toUpperCase()}{" "}
        SPENDING
      </Text>

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
          currentTotal,
          currency
        )}
      </Text>

      {changePercent !==
      null ? (
        <View
          style={
            styles.comparison
          }
        >
          <Feather
            name={
              increased
                ? "trending-up"
                : decreased
                  ? "trending-down"
                  : "minus"
            }
            size={16}
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
              styles.comparisonText,
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
              changePercent
            ).toFixed(0)}
            %{" "}
            {increased
              ? "more"
              : decreased
                ? "less"
                : "change"}{" "}
            than{" "}
            {previousMonthName}
          </Text>
        </View>
      ) : previousTotal ===
          0 &&
        currentTotal > 0 ? (
        <View
          style={
            styles.comparison
          }
        >
          <Feather
            name="info"
            size={16}
            color={
              colors.textSecondary
            }
          />

          <Text
            style={[
              styles.comparisonText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            No spending recorded
            in{" "}
            {previousMonthName}
          </Text>
        </View>
      ) : null}

      <Text
        style={[
          styles.previous,
          {
            color:
              colors.textTertiary,
          },
        ]}
      >
        {previousMonthName}:{" "}
        {formatCurrency(
          previousTotal,
          currency
        )}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      borderRadius:
        BORDER_RADIUS.xl,

      padding:
        SPACING.xl,

      marginBottom:
        SPACING.lg,

      ...SHADOWS.sm,
    },

    label: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,

      letterSpacing: 1,

      marginBottom: 8,
    },

    amount: {
      fontSize: 38,

      fontWeight: "800",

      marginBottom: 12,
    },

    comparison: {
      flexDirection: "row",

      alignItems: "center",

      gap: 6,

      marginBottom: 6,
    },

    comparisonText: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    previous: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
    },
  });