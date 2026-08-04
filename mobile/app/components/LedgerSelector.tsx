import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useLedger } from "@/src/contexts/LedgerContext";
import {
  useCreateLedger,
  useSetDefaultLedger,
} from "@/src/hooks/useLedgers";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function LedgerSelector() {
  const {
    ledgers,
    selectedLedger,
    setSelectedLedger,
  } = useLedger();

  const { colors } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] =
    useState(false);
  const [ledgerName, setLedgerName] = useState("");
  const [switchingLedgerId, setSwitchingLedgerId] =
    useState<string | null>(null);

  const createLedgerMutation = useCreateLedger();
  const setDefaultLedgerMutation = useSetDefaultLedger();

  if (!selectedLedger) {
    return null;
  }

  const handleSelect = async (
    ledger: typeof selectedLedger
  ) => {
    if (ledger.id === selectedLedger.id) {
      setIsOpen(false);
      return;
    }

    try {
      setSwitchingLedgerId(ledger.id);

      const updatedLedger =
        await setDefaultLedgerMutation.mutateAsync(
          ledger.id
        );

     setSelectedLedger(
        updatedLedger ?? {
          ...ledger,
          is_default: true,
        }
      );

      setIsOpen(false);
    } catch (error: any) {
      Alert.alert(
        "Unable to switch ledger",
        error.response?.data?.detail ||
          error.message ||
          "Please try again."
      );
    } finally {
      setSwitchingLedgerId(null);
    }
  };

  const openCreateModal = () => {
    setIsOpen(false);
    setLedgerName("");
    setIsCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    if (createLedgerMutation.isPending) {
      return;
    }

    setLedgerName("");
    setIsCreateModalVisible(false);
  };

  const handleCreateLedger = async () => {
    const trimmedName = ledgerName.trim();

    if (!trimmedName) {
      Alert.alert(
        "Invalid name",
        "Please enter a ledger name."
      );
      return;
    }

    try {
      const createdLedger =
        await createLedgerMutation.mutateAsync({
          name: trimmedName,
        });

      if (createdLedger) {
        const updatedLedger =
          await setDefaultLedgerMutation.mutateAsync(
            createdLedger.id
          );

        setSelectedLedger(
          updatedLedger ?? {
            ...createdLedger,
            is_default: true,
          }
        );
      }

      setLedgerName("");
      setIsCreateModalVisible(false);
    } catch (error: any) {
      Alert.alert(
        "Unable to create ledger",
        error.response?.data?.detail ||
          error.message ||
          "Please try again."
      );
    }
  };

  const isSwitching =
    setDefaultLedgerMutation.isPending;

  return (
    <View
      style={[
        styles.container,
        {
          zIndex: isOpen ? 1000 : 1,
        },
      ]}
    >
      <Pressable
        disabled={isSwitching}
        style={[
          styles.selector,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: isSwitching ? 0.6 : 1,
          },
        ]}
        onPress={() =>
          setIsOpen((previous) => !previous)
        }
      >
        <Text
          numberOfLines={1}
          style={[
            styles.selectedText,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          {selectedLedger.name}
        </Text>

        {isSwitching ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />
        ) : (
          <Feather
            name={
              isOpen
                ? "chevron-up"
                : "chevron-down"
            }
            size={18}
            color={colors.textPrimary}
          />
        )}
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {ledgers.map((ledger) => {
            const isSelected =
              ledger.id === selectedLedger.id;

            const isThisLedgerSwitching =
              switchingLedgerId === ledger.id &&
              isSwitching;

            return (
              <Pressable
                key={ledger.id}
                disabled={isSwitching}
                style={({ pressed }) => [
                  styles.item,
                  {
                    backgroundColor: pressed
                      ? colors.background
                      : colors.surface,
                    opacity: isSwitching
                      ? 0.6
                      : 1,
                  },
                ]}
                onPress={() =>
                  handleSelect(ledger)
                }
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.itemText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {ledger.name}
                </Text>

                {isThisLedgerSwitching ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                  />
                ) : isSelected ? (
                  <Feather
                    name="check"
                    size={16}
                    color={colors.primary}
                  />
                ) : null}
              </Pressable>
            );
          })}

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <Pressable
            disabled={isSwitching}
            style={({ pressed }) => [
              styles.item,
              styles.addLedgerItem,
              {
                backgroundColor: pressed
                  ? colors.background
                  : colors.surface,
                opacity: isSwitching ? 0.6 : 1,
              },
            ]}
            onPress={openCreateModal}
          >
            <Feather
              name="plus"
              size={17}
              color={colors.textPrimary}
            />

            <Text
              style={[
                styles.addLedgerText,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Add Ledger
            </Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCreateModal}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={closeCreateModal}
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Create Ledger
            </Text>

            <Text
              style={[
                styles.modalLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Ledger name
            </Text>

            <TextInput
              value={ledgerName}
              onChangeText={setLedgerName}
              placeholder="e.g. Travel"
              placeholderTextColor={
                colors.textTertiary
              }
              autoFocus
              maxLength={100}
              editable={
                !createLedgerMutation.isPending &&
                !setDefaultLedgerMutation.isPending
              }
              returnKeyType="done"
              onSubmitEditing={
                handleCreateLedger
              }
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  backgroundColor:
                    colors.background,
                  borderColor: colors.border,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeCreateModal}
                disabled={
                  createLedgerMutation.isPending ||
                  setDefaultLedgerMutation.isPending
                }
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.createButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                  (createLedgerMutation.isPending ||
                    setDefaultLedgerMutation.isPending) &&
                    styles.disabledButton,
                ]}
                onPress={handleCreateLedger}
                disabled={
                  createLedgerMutation.isPending ||
                  setDefaultLedgerMutation.isPending
                }
              >
                {createLedgerMutation.isPending ||
                setDefaultLedgerMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.createButtonText
                    }
                  >
                    Create
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    position: "relative",
  },

  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },

  selectedText: {
    flex: 1,
    marginRight: 8,
    fontWeight: "600",
  },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 1000,
    elevation: 12,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  item: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemText: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
  },

  addLedgerItem: {
    justifyContent: "flex-start",
    gap: 8,
  },

  addLedgerText: {
    fontSize: 15,
    fontWeight: "600",
  },

  modalBackdrop: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalCard: {
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 20,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },

  cancelButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  createButton: {
    minWidth: 96,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },
});