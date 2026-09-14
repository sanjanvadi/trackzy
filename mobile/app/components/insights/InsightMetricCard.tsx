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
  icon: keyof typeof Feather.glyphMap;

  label: string;

  value: number;

  currency: string;

  subtitle: string;
}

export default function InsightMetricCard({
  icon,
  label,
  value,
  currency,
  subtitle,
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
        style={[
          styles.icon,
          {
            backgroundColor:
              `${colors.primary}15`,
          },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={
            colors.primary
          }
        />
      </View>

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        {label.toUpperCase()}
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.value,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        {formatCurrency(
          value,
          currency
        )}
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color:
              colors.textTertiary,
          },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      flex: 1,

      borderRadius:
        BORDER_RADIUS.xl,

      padding:
        SPACING.lg,

      ...SHADOWS.sm,
    },

    icon: {
      width: 40,
      height: 40,

      borderRadius: 20,

      justifyContent:
        "center",

      alignItems: "center",

      marginBottom: 14,
    },

    label: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,

      letterSpacing: 0.7,

      marginBottom: 6,
    },

    value: {
      fontSize: 21,

      fontWeight: "700",
    },

    subtitle: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      marginTop: 3,
    },
  });