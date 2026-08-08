// src/components/ConfirmModal.tsx

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/src/contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from "@/src/constants/theme";

interface ConfirmModalProps {
  visible: boolean;

  title: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  icon?: keyof typeof Feather.glyphMap;

  destructive?: boolean;
  loading?: boolean;

  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = "alert-triangle",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { colors, isDark } = useTheme();

  const confirmColor = destructive ? colors.error : colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Tap outside to close */}
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (!loading) {
            onCancel();
          }
        }}
      >
        {/* Prevent taps inside modal from closing it */}
        <Pressable
          style={[
            styles.modal,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: destructive
                  ? isDark
                    ? "rgba(248, 113, 113, 0.15)"
                    : "#FEE2E2"
                  : isDark
                  ? "rgba(59, 130, 246, 0.15)"
                  : "#DBEAFE",
              },
            ]}
          >
            <Feather name={icon} size={26} color={confirmColor} />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {message}
          </Text>

          <View style={styles.actions}>
            <Pressable
              disabled={loading}
              style={[
                styles.button,
                styles.cancelButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              onPress={onCancel}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              disabled={loading}
              style={[
                styles.button,
                {
                  backgroundColor: confirmColor,
                },
                loading && styles.disabledButton,
              ]}
              onPress={onConfirm}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>{confirmText}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modal: {
    width: "100%",
    maxWidth: 400,

    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,

    padding: SPACING.xl,

    alignItems: "center",
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: SPACING.lg,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,

    textAlign: "center",

    marginBottom: SPACING.sm,
  },

  message: {
    fontSize: TYPOGRAPHY.fontSize.body,

    textAlign: "center",
    lineHeight: 22,

    marginBottom: SPACING.xl,
  },

  actions: {
    flexDirection: "row",
    width: "100%",
    gap: SPACING.md,
  },

  button: {
    flex: 1,

    minHeight: 48,

    borderRadius: BORDER_RADIUS.lg,

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: SPACING.md,
  },

  cancelButton: {
    borderWidth: 1,
  },

  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  confirmText: {
    color: "#FFFFFF",

    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  disabledButton: {
    opacity: 0.6,
  },
});
