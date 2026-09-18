import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "@/src/constants/theme";

import { getCurrencySymbol } from "@/src/utils/currency";

import {
  useUser,
  useUpdateUser,
  useDeleteUser,
} from "@/src/hooks/useUsers";

import ConfirmModal from "../components/ConfirmModal";
import ManageLedgersModal from "../components/ManageLedgersModal";


/* -------------------------------------------------------------------------- */
/*                              Currency Options                              */
/* -------------------------------------------------------------------------- */

const CURRENCIES = [
  {
    code: "USD",
    name: "US Dollar",
  },
  {
    code: "EUR",
    name: "Euro",
  },
  {
    code: "GBP",
    name: "British Pound",
  },
  {
    code: "INR",
    name: "Indian Rupee",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
  },
  {
    code: "SEK",
    name: "Swedish Krona",
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
  },
] as const;


/* -------------------------------------------------------------------------- */
/*                               Profile Screen                               */
/* -------------------------------------------------------------------------- */

export default function ProfileScreen() {
  const {
    user,
    signOut,
  } = useAuth();

  const { colors } =
    useTheme();


  /* ------------------------------------------------------------------------ */
  /*                                  Queries                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data: backendUser,
    isLoading: isUserLoading,
  } = useUser();

  const updateUserMutation =
    useUpdateUser();

  const deleteUserMutation =
    useDeleteUser();


  /* ------------------------------------------------------------------------ */
  /*                              Derived User Data                           */
  /* ------------------------------------------------------------------------ */

  const displayName =
    backendUser?.name ||
    user?.displayName ||
    "User";

  const currency =
    backendUser?.currency ||
    "USD";

  const email =
    backendUser?.email ||
    user?.email ||
    "";


  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [
    showSignOutModal,
    setShowSignOutModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    showNameModal,
    setShowNameModal,
  ] = useState(false);

  const [
    showCurrencyModal,
    setShowCurrencyModal,
  ] = useState(false);

  const [
    showManageLedgersModal,
    setShowManageLedgersModal,
  ] = useState(false);

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false);

  const [
    editedName,
    setEditedName,
  ] = useState("");


  /* ------------------------------------------------------------------------ */
  /*                                 Sign Out                                 */
  /* ------------------------------------------------------------------------ */

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut =
    async () => {
      try {
        setIsSigningOut(true);

        await signOut();

        setShowSignOutModal(
          false
        );
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message ||
            "Failed to sign out"
        );
      } finally {
        setIsSigningOut(false);
      }
    };


  /* ------------------------------------------------------------------------ */
  /*                                Edit Name                                 */
  /* ------------------------------------------------------------------------ */

  const handleEditName = () => {
    setEditedName(
      displayName
    );

    setShowNameModal(
      true
    );
  };

  const handleSaveName =
    async () => {
      const name =
        editedName.trim();

      if (!name) {
        Alert.alert(
          "Invalid Name",
          "Name cannot be empty."
        );

        return;
      }

      if (
        name === displayName
      ) {
        setShowNameModal(
          false
        );

        return;
      }

      try {
        await updateUserMutation.mutateAsync(
          {
            name,
          }
        );

        setShowNameModal(
          false
        );
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.response?.data
            ?.detail ||
            error.message ||
            "Failed to update name"
        );
      }
    };


  /* ------------------------------------------------------------------------ */
  /*                              Change Currency                             */
  /* ------------------------------------------------------------------------ */

  const handleCurrencyChange =
    () => {
      setShowCurrencyModal(
        true
      );
    };

  const handleSelectCurrency =
    async (
      newCurrency: string
    ) => {
      if (
        newCurrency ===
        currency
      ) {
        setShowCurrencyModal(
          false
        );

        return;
      }

      try {
        await updateUserMutation.mutateAsync(
          {
            currency:
              newCurrency,
          }
        );

        setShowCurrencyModal(
          false
        );
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.response?.data
            ?.detail ||
            error.message ||
            "Failed to update currency"
        );
      }
    };


  /* ------------------------------------------------------------------------ */
  /*                              Delete Account                              */
  /* ------------------------------------------------------------------------ */

  const handleDeleteAccount =
    () => {
      setShowDeleteModal(
        true
      );
    };

  const confirmDeleteAccount =
    async () => {
      try {
        await deleteUserMutation.mutateAsync();

        setShowDeleteModal(
          false
        );
      } catch (error: any) {
        Alert.alert(
          "Unable to Delete Account",
          error.response?.data
            ?.detail ||
            error.message ||
            "Failed to delete account"
        );
      }
    };


  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,

          paddingTop: 25,
        },
      ]}
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
        {/* -------------------------------------------------------------- */}
        {/* Profile                                                        */}
        {/* -------------------------------------------------------------- */}

        <View
          style={
            styles.profileSection
          }
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    `${colors.primary}15`,
                },
              ]}
            >
              <Feather
                name="user"
                size={48}
                color={
                  colors.primary
                }
              />
            </View>
          </View>


          <View
            style={
              styles.nameRow
            }
          >
            {isUserLoading ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.primary
                }
              />
            ) : (
              <Text
                style={[
                  styles.userName,
                  {
                    color:
                      colors.textPrimary,
                  },
                ]}
              >
                {displayName}
              </Text>
            )}

            <Pressable
              onPress={
                handleEditName
              }
              disabled={
                isUserLoading
              }
              hitSlop={10}
            >
              <Feather
                name="edit-2"
                size={18}
                color={
                  isUserLoading
                    ? colors.textTertiary
                    : colors.primary
                }
              />
            </Pressable>
          </View>


          <Text
            style={[
              styles.userEmail,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {email}
          </Text>
        </View>


        {/* -------------------------------------------------------------- */}
        {/* Preferences                                                    */}
        {/* -------------------------------------------------------------- */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={[
              styles.sectionHeader,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            PREFERENCES
          </Text>

          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            {/* Currency */}

            <Pressable
              style={[
                styles.menuItem,
                {
                  borderBottomColor:
                    colors.border,
                },
              ]}
              onPress={
                handleCurrencyChange
              }
              disabled={
                isUserLoading
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      `${colors.primary}15`,
                  },
                ]}
              >
                <Feather
                  name="dollar-sign"
                  size={20}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.menuTextContainer
                }
              >
                <Text
                  style={[
                    styles.menuLabel,
                    {
                      color:
                        colors.textPrimary,
                    },
                  ]}
                >
                  Currency
                </Text>

                {isUserLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      colors.primary
                    }
                    style={
                      styles.inlineLoader
                    }
                  />
                ) : (
                  <Text
                    style={[
                      styles.menuValue,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {currency} (
                    {getCurrencySymbol(
                      currency
                    )}
                    )
                  </Text>
                )}
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={
                  colors.textTertiary
                }
              />
            </Pressable>


            {/* Manage Ledgers */}

            <Pressable
              style={[
                styles.menuItem,
                styles.lastMenuItem,
              ]}
              onPress={() =>
                setShowManageLedgersModal(
                  true
                )
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor:
                      `${colors.primary}15`,
                  },
                ]}
              >
                <Feather
                  name="book-open"
                  size={20}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.menuTextContainer
                }
              >
                <Text
                  style={[
                    styles.menuLabel,
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
                    styles.menuValue,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  Edit or delete ledgers
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={
                  colors.textTertiary
                }
              />
            </Pressable>
          </View>
        </View>


        {/* -------------------------------------------------------------- */}
        {/* Account                                                        */}
        {/* -------------------------------------------------------------- */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={[
              styles.sectionHeader,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            ACCOUNT
          </Text>

          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <Pressable
              style={[
                styles.menuItem,
                styles.lastMenuItem,
              ]}
              onPress={
                handleDeleteAccount
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  styles.deleteIcon,
                ]}
              >
                <Feather
                  name="trash-2"
                  size={20}
                  color={
                    COLORS.error
                  }
                />
              </View>

              <View
                style={
                  styles.menuTextContainer
                }
              >
                <Text
                  style={[
                    styles.menuLabel,
                    {
                      color:
                        COLORS.error,
                    },
                  ]}
                >
                  Delete Account
                </Text>

                <Text
                  style={[
                    styles.menuSubtext,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  Permanently delete
                  your account and data
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={
                  colors.textTertiary
                }
              />
            </Pressable>
          </View>
        </View>


        {/* -------------------------------------------------------------- */}
        {/* Logout                                                         */}
        {/* -------------------------------------------------------------- */}

        <Pressable
          style={
            styles.logoutButton
          }
          onPress={
            handleSignOut
          }
        >
          <Feather
            name="log-out"
            size={20}
            color={
              COLORS.error
            }
          />

          <Text
            style={
              styles.logoutText
            }
          >
            Logout
          </Text>
        </Pressable>
      </ScrollView>


      {/* ------------------------------------------------------------------ */}
      {/* Edit Name Modal                                                    */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        visible={
          showNameModal
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (
            !updateUserMutation.isPending
          ) {
            setShowNameModal(
              false
            );
          }
        }}
      >
        <KeyboardAvoidingView
          style={
            styles.modalBackdrop
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={() => {
              if (
                !updateUserMutation.isPending
              ) {
                setShowNameModal(
                  false
                );
              }
            }}
          />

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <View
              style={
                styles.modalHeaderCompact
              }
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color:
                      colors.textPrimary,
                  },
                ]}
              >
                Edit Name
              </Text>

              <Pressable
                onPress={() =>
                  setShowNameModal(
                    false
                  )
                }
                disabled={
                  updateUserMutation.isPending
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


            <Text
              style={[
                styles.inputLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              NAME
            </Text>


            <TextInput
              value={
                editedName
              }
              onChangeText={
                setEditedName
              }
              placeholder="Your name"
              placeholderTextColor={
                colors.textTertiary
              }
              autoFocus
              maxLength={100}
              editable={
                !updateUserMutation.isPending
              }
              returnKeyType="done"
              onSubmitEditing={
                handleSaveName
              }
              style={[
                styles.input,
                {
                  color:
                    colors.textPrimary,

                  borderColor:
                    colors.border,

                  backgroundColor:
                    colors.background,
                },
              ]}
            />


            <View
              style={
                styles.modalActions
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
                  updateUserMutation.isPending
                }
                onPress={() =>
                  setShowNameModal(
                    false
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
                    !editedName.trim() ||
                    updateUserMutation.isPending
                  ) &&
                    styles.disabledButton,
                ]}
                disabled={
                  !editedName.trim() ||
                  updateUserMutation.isPending
                }
                onPress={
                  handleSaveName
                }
              >
                {updateUserMutation.isPending ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
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
          </View>
        </KeyboardAvoidingView>
      </Modal>


      {/* ------------------------------------------------------------------ */}
      {/* Currency Modal                                                     */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        visible={
          showCurrencyModal
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (
            !updateUserMutation.isPending
          ) {
            setShowCurrencyModal(
              false
            );
          }
        }}
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={() => {
              if (
                !updateUserMutation.isPending
              ) {
                setShowCurrencyModal(
                  false
                );
              }
            }}
          />

          <View
            style={[
              styles.currencyModal,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        colors.textPrimary,
                    },
                  ]}
                >
                  Select Currency
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  Choose your display
                  currency
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowCurrencyModal(
                    false
                  )
                }
                disabled={
                  updateUserMutation.isPending
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


            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {CURRENCIES.map(
                (item) => {
                  const selected =
                    item.code ===
                    currency;

                  return (
                    <Pressable
                      key={
                        item.code
                      }
                      disabled={
                        updateUserMutation.isPending
                      }
                      onPress={() =>
                        handleSelectCurrency(
                          item.code
                        )
                      }
                      style={[
                        styles.currencyItem,
                        {
                          borderBottomColor:
                            colors.border,

                          backgroundColor:
                            selected
                              ? `${colors.primary}10`
                              : colors.surface,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.currencySymbol,
                          {
                            backgroundColor:
                              `${colors.primary}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.currencySymbolText,
                            {
                              color:
                                colors.primary,
                            },
                          ]}
                        >
                          {getCurrencySymbol(
                            item.code
                          )}
                        </Text>
                      </View>


                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={[
                            styles.currencyCode,
                            {
                              color:
                                colors.textPrimary,
                            },
                          ]}
                        >
                          {item.code}
                        </Text>

                        <Text
                          style={[
                            styles.currencyName,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </View>


                      {selected && (
                        <Feather
                          name="check"
                          size={20}
                          color={
                            colors.primary
                          }
                        />
                      )}
                    </Pressable>
                  );
                }
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>


      {/* ------------------------------------------------------------------ */}
      {/* Manage Ledgers                                                     */}
      {/* ------------------------------------------------------------------ */}

      <ManageLedgersModal
        visible={
          showManageLedgersModal
        }
        onClose={() =>
          setShowManageLedgersModal(
            false
          )
        }
      />


      {/* ------------------------------------------------------------------ */}
      {/* Sign Out Confirmation                                              */}
      {/* ------------------------------------------------------------------ */}

      <ConfirmModal
        visible={
          showSignOutModal
        }
        title="Sign Out?"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        icon="log-out"
        destructive
        loading={
          isSigningOut
        }
        onCancel={() =>
          setShowSignOutModal(
            false
          )
        }
        onConfirm={
          confirmSignOut
        }
      />


      {/* ------------------------------------------------------------------ */}
      {/* Delete Account Confirmation                                       */}
      {/* ------------------------------------------------------------------ */}

      <ConfirmModal
        visible={
          showDeleteModal
        }
        title="Delete Account?"
        message="This will permanently delete your Trackzy account and all associated data. This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        icon="trash-2"
        destructive
        loading={
          deleteUserMutation.isPending
        }
        onCancel={() =>
          setShowDeleteModal(
            false
          )
        }
        onConfirm={
          confirmDeleteAccount
        }
      />
    </View>
  );
}


/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    header: {
      alignItems: "center",
      paddingHorizontal:
        SPACING.lg,
      paddingTop:
        SPACING.xl,
      paddingBottom:
        SPACING.md,
    },

    headerTitle: {
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
      paddingBottom: 100,
    },

    profileSection: {
      alignItems: "center",
      paddingVertical:
        SPACING.xl,
      marginBottom:
        SPACING.lg,
    },

    avatarContainer: {
      position: "relative",
      marginBottom:
        SPACING.md,
    },

    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent:
        "center",
      alignItems: "center",
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom:
        SPACING.xs,
    },

    userName: {
      fontSize:
        TYPOGRAPHY.fontSize.h1,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
    },

    userEmail: {
      fontSize:
        TYPOGRAPHY.fontSize.body,
    },

    section: {
      marginBottom:
        SPACING.xl,
    },

    sectionHeader: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
      letterSpacing: 1,
      marginBottom:
        SPACING.md,
    },

    sectionContent: {
      borderRadius:
        BORDER_RADIUS.xl,
      overflow: "hidden",
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding:
        SPACING.lg,
      gap:
        SPACING.md,
      borderBottomWidth: 1,
    },

    lastMenuItem: {
      borderBottomWidth: 0,
    },

    menuIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent:
        "center",
      alignItems: "center",
    },

    deleteIcon: {
      backgroundColor:
        "#FFEBEE",
    },

    menuTextContainer: {
      flex: 1,
    },

    menuLabel: {
      fontSize:
        TYPOGRAPHY.fontSize.body,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
      marginBottom: 2,
    },

    menuValue: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
    },

    menuSubtext: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
      marginTop: 2,
    },

    inlineLoader: {
      alignSelf: "flex-start",
      marginTop: 2,
    },

    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap:
        SPACING.sm,
      backgroundColor:
        "#FFEBEE",
      paddingVertical:
        SPACING.lg,
      borderRadius:
        BORDER_RADIUS.full,
      marginTop:
        SPACING.lg,
    },

    logoutText: {
      fontSize:
        TYPOGRAPHY.fontSize.body,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
      color:
        COLORS.error,
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "center",
      padding:
        SPACING.lg,
      backgroundColor:
        "rgba(0,0,0,0.5)",
    },

    modalCard: {
      borderRadius:
        BORDER_RADIUS.xl,
      padding:
        SPACING.lg,
    },

    currencyModal: {
      borderRadius:
        BORDER_RADIUS.xl,
      maxHeight: "75%",
      overflow: "hidden",
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems:
        "flex-start",
      padding:
        SPACING.lg,
    },

    modalHeaderCompact: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom:
        SPACING.lg,
    },

    modalTitle: {
      fontSize:
        TYPOGRAPHY.fontSize.h2,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
    },

    modalSubtitle: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
      marginTop: 4,
    },

    inputLabel: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
      letterSpacing: 0.8,
      marginBottom:
        SPACING.sm,
    },

    input: {
      borderWidth: 1,
      borderRadius:
        BORDER_RADIUS.lg,
      paddingHorizontal:
        SPACING.md,
      paddingVertical:
        SPACING.md,
      fontSize:
        TYPOGRAPHY.fontSize.body,
    },

    modalActions: {
      flexDirection: "row",
      justifyContent:
        "flex-end",
      gap:
        SPACING.md,
      marginTop:
        SPACING.lg,
    },

    cancelButton: {
      borderWidth: 1,
      paddingVertical:
        SPACING.md,
      paddingHorizontal:
        SPACING.lg,
      borderRadius:
        BORDER_RADIUS.full,
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
      alignItems: "center",
      justifyContent:
        "center",
      paddingVertical:
        SPACING.md,
      paddingHorizontal:
        SPACING.lg,
      borderRadius:
        BORDER_RADIUS.full,
    },

    saveText: {
      color: "#FFFFFF",
      fontSize:
        TYPOGRAPHY.fontSize.body,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .semibold,
    },

    disabledButton: {
      opacity: 0.5,
    },

    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 68,
      paddingHorizontal:
        SPACING.lg,
      gap:
        SPACING.md,
      borderBottomWidth: 1,
    },

    currencySymbol: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent:
        "center",
      alignItems: "center",
    },

    currencySymbolText: {
      fontSize: 18,
      fontWeight: "700",
    },

    currencyCode: {
      fontSize:
        TYPOGRAPHY.fontSize.body,
      fontWeight:
        TYPOGRAPHY.fontWeight
          .bold,
    },

    currencyName: {
      fontSize:
        TYPOGRAPHY.fontSize
          .caption,
      marginTop: 2,
    },
  });