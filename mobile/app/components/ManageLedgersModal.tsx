import {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import {
  useUpdateLedger,
  useDeleteLedger,
  useSetDefaultLedger,
} from "@/src/hooks/useLedgers";

import { useLedger } from "@/src/contexts/LedgerContext";
import { useTheme } from "@/src/contexts/ThemeContext";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "@/src/constants/theme";

import type {
  LedgerRead,
} from "@/src/types/api";

import ConfirmModal from "./ConfirmModal";


interface Props {
  visible: boolean;
  onClose: () => void;
}


export default function ManageLedgersModal({
  visible,
  onClose,
}: Props) {
  const {
    ledgers,
    selectedLedger,
    setSelectedLedger,
  } = useLedger();

  const { colors } =
    useTheme();

  const updateLedgerMutation =
    useUpdateLedger();

  const deleteLedgerMutation =
    useDeleteLedger();

  /*
   * Only used when the currently selected
   * ledger gets deleted.
   */
  const setDefaultLedgerMutation =
    useSetDefaultLedger();


  const [
    editingLedger,
    setEditingLedger,
  ] =
    useState<LedgerRead | null>(
      null
    );

  const [
    deletingLedger,
    setDeletingLedger,
  ] =
    useState<LedgerRead | null>(
      null
    );

  const [
    ledgerName,
    setLedgerName,
  ] = useState("");


  const isBusy =
    updateLedgerMutation.isPending ||
    deleteLedgerMutation.isPending ||
    setDefaultLedgerMutation.isPending;


  /* ------------------------------------------------------------------------ */
  /*                             Reset Modal State                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!visible) {
      setEditingLedger(null);
      setDeletingLedger(null);
      setLedgerName("");
    }
  }, [visible]);


  const closeModal = () => {
    if (isBusy) {
      return;
    }

    setEditingLedger(null);
    setDeletingLedger(null);
    setLedgerName("");

    onClose();
  };


  /* ------------------------------------------------------------------------ */
  /*                                Edit Ledger                               */
  /* ------------------------------------------------------------------------ */

  const handleEditLedger = (
    ledger: LedgerRead
  ) => {
    setLedgerName(
      ledger.name
    );

    setEditingLedger(
      ledger
    );
  };


  const handleSaveLedger =
    async () => {
      if (!editingLedger) {
        return;
      }

      const trimmedName =
        ledgerName.trim();

      if (!trimmedName) {
        Alert.alert(
          "Invalid name",
          "Ledger name cannot be empty."
        );

        return;
      }

      if (
        trimmedName ===
        editingLedger.name
      ) {
        setEditingLedger(
          null
        );

        return;
      }

      try {
        const updatedLedger =
          await updateLedgerMutation.mutateAsync(
            {
              id:
                editingLedger.id,

              data: {
                name:
                  trimmedName,
              },
            }
          );

        /*
         * React Query refreshes the ledger
         * list, but selectedLedger is also
         * stored in LedgerContext.
         *
         * Update it immediately if we're
         * renaming the active ledger.
         */
        if (
          selectedLedger?.id ===
          editingLedger.id
        ) {
          setSelectedLedger(
            updatedLedger ?? {
              ...editingLedger,
              name:
                trimmedName,
            }
          );
        }

        setEditingLedger(
          null
        );

        setLedgerName("");
      } catch (error: any) {
        Alert.alert(
          "Unable to update ledger",

          error.response?.data
            ?.detail ||
            error.message ||
            "Please try again."
        );
      }
    };


  /* ------------------------------------------------------------------------ */
  /*                               Delete Ledger                              */
  /* ------------------------------------------------------------------------ */

  const handleDeleteLedger = (
    ledger: LedgerRead
  ) => {
    /*
     * Trackzy needs at least one ledger
     * because most screens depend on
     * selectedLedger.
     */
    if (
      ledgers.length <= 1
    ) {
      Alert.alert(
        "Cannot delete ledger",
        "You must have at least one ledger."
      );

      return;
    }

    setDeletingLedger(
      ledger
    );
  };


  const confirmDeleteLedger =
    async () => {
      if (!deletingLedger) {
        return;
      }

      const ledgerId =
        deletingLedger.id;

      const wasSelected =
        selectedLedger?.id ===
        ledgerId;

      const remainingLedgers =
        ledgers.filter(
          (ledger) =>
            ledger.id !==
            ledgerId
        );

      try {
        await deleteLedgerMutation.mutateAsync(
          ledgerId
        );

        /*
         * If the deleted ledger was the
         * currently selected ledger, move
         * the user onto another ledger.
         */
        if (
          wasSelected &&
          remainingLedgers.length >
            0
        ) {
          const replacement =
            remainingLedgers.find(
              (ledger) =>
                ledger.is_default
            ) ??
            remainingLedgers[0];

          /*
           * Make the replacement the
           * backend default too.
           */
          const updatedLedger =
            await setDefaultLedgerMutation.mutateAsync(
              replacement.id
            );

          setSelectedLedger(
            updatedLedger ?? {
              ...replacement,
              is_default: true,
            }
          );
        }

        setDeletingLedger(
          null
        );
      } catch (error: any) {
        Alert.alert(
          "Unable to delete ledger",

          error.response?.data
            ?.detail ||
            error.message ||
            "Please try again."
        );
      }
    };


  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={
          closeModal
        }
      >
        <Pressable
          style={
            styles.backdrop
          }
          onPress={
            closeModal
          }
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            {editingLedger ? (
              <>
                {/* Edit Header */}

                <View
                  style={
                    styles.header
                  }
                >
                  <Pressable
                    onPress={() => {
                      if (!isBusy) {
                        setEditingLedger(
                          null
                        );
                      }
                    }}
                    disabled={
                      isBusy
                    }
                    hitSlop={10}
                  >
                    <Feather
                      name="arrow-left"
                      size={22}
                      color={
                        colors.textPrimary
                      }
                    />
                  </Pressable>

                  <Text
                    style={[
                      styles.title,
                      {
                        color:
                          colors.textPrimary,
                      },
                    ]}
                  >
                    Edit Ledger
                  </Text>

                  <View
                    style={{
                      width: 22,
                    }}
                  />
                </View>


                {/* Name */}

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  LEDGER NAME
                </Text>

                <TextInput
                  value={
                    ledgerName
                  }
                  onChangeText={
                    setLedgerName
                  }
                  placeholder="Ledger name"
                  placeholderTextColor={
                    colors.textTertiary
                  }
                  maxLength={100}
                  autoFocus
                  editable={
                    !isBusy
                  }
                  returnKeyType="done"
                  onSubmitEditing={
                    handleSaveLedger
                  }
                  style={[
                    styles.input,
                    {
                      color:
                        colors.textPrimary,

                      backgroundColor:
                        colors.background,

                      borderColor:
                        colors.border,
                    },
                  ]}
                />


                {/* Actions */}

                <View
                  style={
                    styles.actions
                  }
                >
                  <Pressable
                    style={[
                      styles.cancelButton,
                      {
                        borderColor:
                          colors.border,
                      },
                    ]}
                    disabled={
                      isBusy
                    }
                    onPress={() =>
                      setEditingLedger(
                        null
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.cancelText,
                        {
                          color:
                            colors.textPrimary,
                        },
                      ]}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor:
                          colors.primary,
                      },

                      (
                        !ledgerName.trim() ||
                        isBusy
                      ) &&
                        styles.disabled,
                    ]}
                    disabled={
                      !ledgerName.trim() ||
                      isBusy
                    }
                    onPress={
                      handleSaveLedger
                    }
                  >
                    {updateLedgerMutation.isPending ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.saveText
                        }
                      >
                        Save
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {/* Manage Header */}

                <View
                  style={
                    styles.header
                  }
                >
                  <View>
                    <Text
                      style={[
                        styles.title,
                        {
                          color:
                            colors.textPrimary,
                        },
                      ]}
                    >
                      Manage Ledgers
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
                      Edit or delete
                      your ledgers
                    </Text>
                  </View>

                  <Pressable
                    onPress={
                      closeModal
                    }
                    disabled={
                      isBusy
                    }
                    hitSlop={10}
                  >
                    <Feather
                      name="x"
                      size={22}
                      color={
                        colors.textSecondary
                      }
                    />
                  </Pressable>
                </View>


                {/* Ledger List */}

                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }
                  style={
                    styles.ledgerList
                  }
                >
                  {ledgers.map(
                    (
                      ledger,
                      index
                    ) => {
                      const isSelected =
                        ledger.id ===
                        selectedLedger?.id;

                      const isLast =
                        ledgers.length ===
                        1;

                      return (
                        <View
                          key={
                            ledger.id
                          }
                          style={[
                            styles.ledgerRow,

                            index !==
                              ledgers.length -
                                1 && {
                              borderBottomWidth:
                                StyleSheet.hairlineWidth,

                              borderBottomColor:
                                colors.border,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.ledgerIcon,
                              {
                                backgroundColor:
                                  `${colors.primary}15`,
                              },
                            ]}
                          >
                            <Feather
                              name="book"
                              size={19}
                              color={
                                colors.primary
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.ledgerInfo
                            }
                          >
                            <View
                              style={
                                styles.ledgerNameRow
                              }
                            >
                              <Text
                                numberOfLines={
                                  1
                                }
                                style={[
                                  styles.ledgerName,
                                  {
                                    color:
                                      colors.textPrimary,
                                  },
                                ]}
                              >
                                {
                                  ledger.name
                                }
                              </Text>

                              {isSelected && (
                                <View
                                  style={[
                                    styles.currentBadge,
                                    {
                                      backgroundColor:
                                        `${colors.primary}15`,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.currentBadgeText,
                                      {
                                        color:
                                          colors.primary,
                                      },
                                    ]}
                                  >
                                    Current
                                  </Text>
                                </View>
                              )}
                            </View>

                            {ledger.is_default && (
                              <Text
                                style={[
                                  styles.defaultText,
                                  {
                                    color:
                                      colors.textSecondary,
                                  },
                                ]}
                              >
                                Default ledger
                              </Text>
                            )}
                          </View>


                          {/* Edit */}

                          <Pressable
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor:
                                  `${colors.primary}10`,
                              },
                            ]}
                            disabled={
                              isBusy
                            }
                            onPress={() =>
                              handleEditLedger(
                                ledger
                              )
                            }
                            hitSlop={5}
                          >
                            <Feather
                              name="edit-2"
                              size={17}
                              color={
                                colors.primary
                              }
                            />
                          </Pressable>


                          {/* Delete */}

                          <Pressable
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor:
                                  isLast
                                    ? colors.background
                                    : "#FFEBEE",
                              },
                            ]}
                            disabled={
                              isBusy ||
                              isLast
                            }
                            onPress={() =>
                              handleDeleteLedger(
                                ledger
                              )
                            }
                            hitSlop={5}
                          >
                            <Feather
                              name="trash-2"
                              size={17}
                              color={
                                isLast
                                  ? colors.textTertiary
                                  : COLORS.error
                              }
                            />
                          </Pressable>
                        </View>
                      );
                    }
                  )}
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>


      {/* Delete Confirmation */}

      <ConfirmModal
        visible={
          !!deletingLedger
        }
        title="Delete Ledger?"
        message={
          deletingLedger
            ? `Delete "${deletingLedger.name}" and all expenses associated with it? This cannot be undone.`
            : ""
        }
        confirmText="Delete Ledger"
        cancelText="Cancel"
        icon="trash-2"
        destructive
        loading={
          deleteLedgerMutation.isPending ||
          setDefaultLedgerMutation.isPending
        }
        onCancel={() => {
          if (!isBusy) {
            setDeletingLedger(
              null
            );
          }
        }}
        onConfirm={
          confirmDeleteLedger
        }
      />
    </>
  );
}


const styles =
  StyleSheet.create({
    backdrop: {
      flex: 1,

      justifyContent:
        "center",

      paddingHorizontal:
        SPACING.lg,

      backgroundColor:
        "rgba(0,0,0,0.5)",
    },

    modalCard: {
      width: "100%",

      maxHeight: "75%",

      borderRadius:
        BORDER_RADIUS.xl,

      padding:
        SPACING.lg,
    },

    header: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom:
        SPACING.lg,
    },

    title: {
      fontSize:
        TYPOGRAPHY.fontSize.h2,

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

    ledgerList: {
      maxHeight: 420,
    },

    ledgerRow: {
      minHeight: 72,

      flexDirection: "row",

      alignItems: "center",

      gap:
        SPACING.sm,

      paddingVertical:
        SPACING.md,
    },

    ledgerIcon: {
      width: 42,
      height: 42,

      borderRadius: 21,

      alignItems: "center",

      justifyContent:
        "center",
    },

    ledgerInfo: {
      flex: 1,
    },

    ledgerNameRow: {
      flexDirection: "row",

      alignItems: "center",

      gap: 7,
    },

    ledgerName: {
      flexShrink: 1,

      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    defaultText: {
      marginTop: 3,

      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
    },

    currentBadge: {
      paddingHorizontal: 7,

      paddingVertical: 3,

      borderRadius:
        BORDER_RADIUS.full,
    },

    currentBadgeText: {
      fontSize: 10,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    actionButton: {
      width: 38,
      height: 38,

      borderRadius: 19,

      alignItems: "center",

      justifyContent:
        "center",
    },

    label: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,

      letterSpacing: 0.7,

      marginBottom:
        SPACING.sm,
    },

    input: {
      minHeight: 48,

      borderWidth: 1,

      borderRadius:
        BORDER_RADIUS.lg,

      paddingHorizontal:
        SPACING.md,

      fontSize:
        TYPOGRAPHY.fontSize.body,
    },

    actions: {
      flexDirection: "row",

      justifyContent:
        "flex-end",

      gap:
        SPACING.md,

      marginTop:
        SPACING.lg,
    },

    cancelButton: {
      minHeight: 44,

      borderWidth: 1,

      borderRadius:
        BORDER_RADIUS.full,

      paddingHorizontal:
        SPACING.lg,

      alignItems: "center",

      justifyContent:
        "center",
    },

    cancelText: {
      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    saveButton: {
      minWidth: 100,

      minHeight: 44,

      borderRadius:
        BORDER_RADIUS.full,

      paddingHorizontal:
        SPACING.lg,

      alignItems: "center",

      justifyContent:
        "center",
    },

    saveText: {
      color: "#FFFFFF",

      fontSize:
        TYPOGRAPHY.fontSize.body,

      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    disabled: {
      opacity: 0.5,
    },
  });