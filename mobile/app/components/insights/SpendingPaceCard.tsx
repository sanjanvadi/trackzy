import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import {
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "@/src/constants/theme";

import { useTheme } from "@/src/contexts/ThemeContext";

import { formatCurrency } from "@/src/utils/currency";

interface Props {
  projectedSpend: number;

  monthName: string;

  currency: string;
}

export default function SpendingPaceCard({
  projectedSpend,
  monthName,
  currency,
}: Props) {
  const { colors } =
    useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            `${colors.primary}10`,

          borderColor:
            `${colors.primary}25`,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor:
              `${colors.primary}18`,
          },
        ]}
      >
        <Feather
          name="activity"
          size={22}
          color={
            colors.primary
          }
        />
      </View>

      <View
        style={{
          flex: 1,
        }}
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
          Spending pace
        </Text>

        <Text
          style={[
            styles.text,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          At your current pace,
          you're projected to
          spend{" "}

          {formatCurrency(
            projectedSpend,
            currency
          )}

          {" "}by the end of{" "}
          {monthName}.
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      flexDirection: "row",

      borderWidth: 1,

      borderRadius:
        BORDER_RADIUS.xl,

      padding:
        SPACING.lg,

      gap: SPACING.md,

      marginBottom:
        SPACING.lg,
    },

    icon: {
      width: 44,
      height: 44,

      borderRadius: 22,

      justifyContent:
        "center",

      alignItems: "center",
    },

    title: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,

      marginBottom: 5,
    },

    text: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      lineHeight: 21,
    },
  });