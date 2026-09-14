import { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Feather } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { useTheme } from "@/src/contexts/ThemeContext";

import { useLedger } from "@/src/contexts/LedgerContext";

import { useInsights } from "@/src/hooks/useInsights";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
} from "@/src/constants/theme";

import MonthlyOverviewCard from "../components/insights/MonthlyOverviewCard";

import InsightMetricCard from "../components/insights/InsightMetricCard"; 

import CategoryBreakdownCard from "../components/insights/CategoryBreakdownCard"; 

import HighlightsCard from "../components/insights/HighlightsCard";

import SpendingPaceCard from "../components/insights/SpendingPaceCard";

import CreateExpenseModal from "../components/CreateExpenseModal";

export default function InsightsScreen() {
  const router =
    useRouter();

  const { colors } =
    useTheme();

  const { selectedLedger } =
    useLedger();

  const [
    showCreateExpenseModal,
    setShowCreateExpenseModal,
  ] = useState(false);

  const insights =
    useInsights(
      selectedLedger?.id || ""
    );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      edges={["top"]}
    >
      {/* Header */}

      <View
        style={[
          styles.header,
          {
            backgroundColor:
              colors.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              color:
                colors.textPrimary,
            },
          ]}
        >
          Trackzy
        </Text>
      </View>

      {insights.isLoading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
          />

          <Text
            style={[
              styles.loadingText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Calculating insights...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={
            styles.scrollView
          }
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* Page intro */}

          <View
            style={
              styles.intro
            }
          >
            <Text
              style={[
                styles.pageTitle,
                {
                  color:
                    colors.textPrimary,
                },
              ]}
            >
              Financial Overview
            </Text>

            <Text
              style={[
                styles.pageSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Understand where
              your money is going
              and how your
              spending is
              changing.
            </Text>
          </View>

          {/* Monthly Summary */}

          <MonthlyOverviewCard
            currentMonthName={
              insights.currentMonthName
            }
            previousMonthName={
              insights.previousMonthName
            }
            currentTotal={
              insights.currentTotal
            }
            previousTotal={
              insights.previousTotal
            }
            changePercent={
              insights.monthChangePercent
            }
            currency={
              insights.currency
            }
          />

          {/* Metrics */}

          <View
            style={
              styles.metricRow
            }
          >
            <InsightMetricCard
              icon="calendar"
              label="Daily Avg"
              value={
                insights.averageDailySpend
              }
              currency={
                insights.currency
              }
              subtitle="per day"
            />

            <InsightMetricCard
              icon="trending-up"
              label="Projected"
              value={
                insights.projectedMonthSpend
              }
              currency={
                insights.currency
              }
              subtitle="month-end"
            />
          </View>

          {/* Category Insights */}

          <CategoryBreakdownCard
            categories={
              insights.categoryData
            }
            currency={
              insights.currency
            }
            previousMonthName={
              insights.previousMonthName
            }
          />

          {/* Highlights */}

          <HighlightsCard
            topCategory={
              insights.topCategory
            }
            largestExpense={
              insights.largestExpense
            }
            highestSpendingDay={
              insights.highestSpendingDay
            }
            currency={
              insights.currency
            }
          />

          {/* Spending Pace */}

          <SpendingPaceCard
            projectedSpend={
              insights.projectedMonthSpend
            }
            monthName={
              insights.currentMonthName
            }
            currency={
              insights.currency
            }
          />
        </ScrollView>
      )}

      {/* Create Expense */}

      <CreateExpenseModal
        visible={
          showCreateExpenseModal
        }
        onClose={() =>
          setShowCreateExpenseModal(
            false
          )
        }
      />

      {/* Add Expense FAB */}

      <Pressable
        style={[
          styles.addFab,
          {
            backgroundColor:
              colors.primary,
          },
        ]}
        onPress={() =>
          setShowCreateExpenseModal(
            true
          )
        }
      >
        <Feather
          name="plus"
          size={28}
          color="#FFFFFF"
        />
      </Pressable>

      {/* Voice FAB */}

      <Pressable
        style={[
          styles.voiceFab,
          {
            backgroundColor:
              colors.primary,
          },
        ]}
        onPress={() =>
          router.push(
            "/voice-recording"
          )
        }
      >
        <Feather
          name="mic"
          size={28}
          color="#FFFFFF"
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        SPACING.lg,

      paddingVertical:
        SPACING.md,
    },

    headerTitle: {
      flex: 1,

      textAlign: "center",

      fontSize:
        TYPOGRAPHY.fontSize.h2,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      padding:
        SPACING.lg,

      paddingBottom: 130,
    },

    intro: {
      marginBottom:
        SPACING.xl,
    },

    pageTitle: {
      fontSize:
        TYPOGRAPHY.fontSize.h1,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,

      marginBottom:
        SPACING.xs,
    },

    pageSubtitle: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      lineHeight: 22,
    },

    metricRow: {
      flexDirection: "row",

      gap: SPACING.md,

      marginBottom:
        SPACING.lg,
    },

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      gap: SPACING.md,
    },

    loadingText: {
      fontSize:
        TYPOGRAPHY.fontSize.body,
    },

    addFab: {
      position: "absolute",

      bottom: 156,
      right: SPACING.lg,

      width: 64,
      height: 64,

      borderRadius: 32,

      justifyContent:
        "center",

      alignItems: "center",

      elevation: 8,

      shadowColor: "#000",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.25,

      shadowRadius: 8,
    },

    voiceFab: {
      position: "absolute",

      bottom: 80,
      right: SPACING.lg,

      width: 64,
      height: 64,

      borderRadius: 32,

      justifyContent:
        "center",

      alignItems: "center",

      elevation: 8,

      shadowColor: "#000",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.3,

      shadowRadius: 8,
    },
  });