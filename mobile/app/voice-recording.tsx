import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING } from '@/src/constants/theme';
import { useParseVoice } from '@/src/hooks/useVoice';

import EditExpenseModal from '@/app/components/EditExpenseModal';
import ConfirmModal from '@/app/components/ConfirmModal';

import {
  useUpdateExpense,
  useDeleteExpense,
} from '@/src/hooks/useExpenses';

import {
  ExpenseRead,
  ExpenseUpdate,
  Category,
  ExpenseToolInput,
} from '@/src/types/api';

export default function VoiceRecordingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcription, setTranscription] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [candidates, setCandidates] = useState<ExpenseRead[]>([]);

  const [pendingIntent, setPendingIntent] = useState<'edit_expense' | 'delete_expense' | null>(null);

  const [pendingLedgerId, setPendingLedgerId] = useState<string | null>(null);

  const [pendingToolInput, setPendingToolInput] = useState<ExpenseToolInput | null>(null);

  const [selectedExpense, setSelectedExpense] = useState<ExpenseRead | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const parseVoiceMutation = useParseVoice();

  const resetPendingAction = () => {
  setCandidates([]);
  setPendingIntent(null);
  setPendingLedgerId(null);
  setPendingToolInput(null);
  setSelectedExpense(null);
  setEditModalVisible(false);
  setDeleteModalVisible(false);
};

  //prefill edit fields from tool_input
  const buildVoiceEditedExpense = (
    expense: ExpenseRead,
    toolInput: ExpenseToolInput | null
  ): ExpenseRead => {
    if (!toolInput) {
      return expense;
    }

    return {
      ...expense,

      ...(toolInput.amount !== null &&
      toolInput.amount !== undefined
        ? {
            amount: Number(toolInput.amount),
          }
        : {}),

      ...(toolInput.category
        ? {
            category: toolInput.category as Category,
          }
        : {}),

      ...(toolInput.note !== null &&
      toolInput.note !== undefined
        ? {
            note: toolInput.note,
          }
        : {}),

      ...(toolInput.date
        ? {
            date: toolInput.date,
          }
        : {}),
    };
  };

  //candidates selection handler
  const handleCandidateSelect = (expense: ExpenseRead) => {
    if (pendingIntent === 'edit_expense') {
      const prefilledExpense = buildVoiceEditedExpense(
        expense,
        pendingToolInput
      );

      setSelectedExpense(prefilledExpense);
      setEditModalVisible(true);
      return;
    }

    if (pendingIntent === 'delete_expense') {
      setSelectedExpense(expense);
      setDeleteModalVisible(true);
    }
  };

  //edit expense save handler
  const handleVoiceEditSave = async (
    expenseId: string,
    data: ExpenseUpdate
  ) => {
    if (!pendingLedgerId) {
      Alert.alert('Error', 'Ledger information is missing.');
      return;
    }

    try {
      await updateExpenseMutation.mutateAsync({
        ledgerId: pendingLedgerId,
        expenseId,
        data,
      });

      setEditModalVisible(false);
      resetPendingAction();

      Alert.alert(
        'Success',
        'Expense updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.detail ||
          error.message ||
          'Could not update the expense.'
      );
    }
  };

  //handle delete
  const handleVoiceDelete = async () => {
    if (!selectedExpense || !pendingLedgerId) {
      return;
    }

    try {
      await deleteExpenseMutation.mutateAsync({
        ledgerId: pendingLedgerId,
        expenseId: selectedExpense.id,
      });

      setDeleteModalVisible(false);
      resetPendingAction();

      Alert.alert(
        'Success',
        'Expense deleted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Delete Failed',
        error.response?.data?.detail ||
          error.message ||
          'Could not delete the expense.'
      );
    }
  };

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef(
    Array.from({ length: 10 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    requestPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startWaveformAnimation();
    }
  }, [isRecording]);

  // Timer for recording duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      setRecordingDuration(0);
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (granted) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error('Failed to get permissions:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveformAnimation = () => {
    const animations = waveformAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.7 + 0.3,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      Alert.alert('Permission Required', 'Microphone permission is required for voice input');
      return;
    }

    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setTranscription('');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        Alert.alert('Error', 'Failed to save recording');
        return;
      }

      setIsProcessing(true);
      setTranscription('Processing...');

      // Upload audio to backend and parse
      parseVoiceMutation.mutate(uri, {
        onSuccess: (data) => {
          setIsProcessing(false);

          // Invalidate queries to refresh data across the app
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
          queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });

          // Handle different intents
          if (data.intent === 'add_expense') {
            // Backend already created the expense, show success and go back
            setTranscription(data.message);
            Alert.alert(
              'Success!',
              'Your expense has been added via voice.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          } else if (data.candidates && data.candidates.length > 0) {
              setTranscription(data.message);

              setCandidates(data.candidates as ExpenseRead[]);

              setPendingIntent(
                data.intent as 'edit_expense' | 'delete_expense'
              );

              setPendingLedgerId(data.ledger_id ?? null);

              setPendingToolInput(
                data.tool_input as ExpenseToolInput
              );
            } else if (data.summary) {
            // Query intent - show summary
            setTranscription(data.message);
            Alert.alert('Summary', data.message);
            setTimeout(() => router.back(), 2000);
          } else {
            // Fallback
            setTranscription(data.message);
            setTimeout(() => router.back(), 2000);
          }
        },
        onError: (error: any) => {
          console.error('Voice parsing failed:', error);
          setIsProcessing(false);
          setTranscription('');
          Alert.alert(
            'Failed to Process',
            error.response?.data?.detail || error.message || 'Could not process voice input. Please try again.',
            [
              { text: 'OK', onPress: () => router.back() },
            ]
          );
        },
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleClose = () => {
    if (isProcessing) {
      return;
    }
    if (recording && isRecording) {
      recording.stopAndUnloadAsync();
    }
    router.back();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Trackzy</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Main Content */}
        {candidates.length > 0 ? (
          <View style={styles.candidateSection}>
            <View style={styles.candidateHeader}>
              <Feather
                name={
                  pendingIntent === 'delete_expense'
                    ? 'trash-2'
                    : 'edit-3'
                }
                size={28}
                color={
                  pendingIntent === 'delete_expense'
                    ? colors.error
                    : colors.primary
                }
              />

              <Text
                style={[
                  styles.candidateTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {pendingIntent === 'delete_expense'
                  ? 'Select Expense to Delete'
                  : 'Select Expense to Edit'}
              </Text>

              <Text
                style={[
                  styles.candidateMessage,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {transcription}
              </Text>
            </View>

            <ScrollView
              style={styles.candidateList}
              contentContainerStyle={styles.candidateListContent}
              showsVerticalScrollIndicator={false}
            >
              {candidates.map((expense) => (
                <Pressable
                  key={expense.id}
                  disabled={
                    updateExpenseMutation.isPending ||
                    deleteExpenseMutation.isPending
                  }
                  onPress={() =>
                    handleCandidateSelect(expense)
                  }
                  style={({ pressed }) => [
                    styles.candidateCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    pressed && styles.candidateCardPressed,
                  ]}
                >
                  <View style={styles.candidateInfo}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.candidateNote,
                        {
                          color: colors.textPrimary,
                        },
                      ]}
                    >
                      {expense.note || 'No description'}
                    </Text>

                    <View style={styles.candidateMetadata}>
                      <Text
                        style={[
                          styles.candidateMetaText,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {expense.category
                          .charAt(0)
                          .toUpperCase() +
                          expense.category.slice(1)}
                      </Text>

                      <Text
                        style={{
                          color: colors.textTertiary,
                        }}
                      >
                        •
                      </Text>

                      <Text
                        style={[
                          styles.candidateMetaText,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {new Date(
                          `${expense.date}T00:00:00`
                        ).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.candidateRight}>
                    <Text
                      style={[
                        styles.candidateAmount,
                        {
                          color: colors.textPrimary,
                        },
                      ]}
                    >
                      ${Number(expense.amount).toFixed(2)}
                    </Text>

                    <Feather
                      name="chevron-right"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={() => {
                resetPendingAction();
                setTranscription('');
              }}
              style={[
                styles.tryAgainButton,
                {
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather
                name="mic"
                size={18}
                color={colors.textPrimary}
              />

              <Text
                style={[
                  styles.tryAgainText,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                Try another voice command
              </Text>
            </Pressable>
          </View>
        ):(<View style={styles.content}>
          {/* Ripple Effect Container */}
          <View style={styles.rippleContainer}>
            {/* Outer Ripples */}
            <Animated.View
              style={[
                styles.ripple,
                styles.rippleOuter,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.ripple,
                styles.rippleMiddle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />

            {/* Microphone Button */}
            <Pressable
              style={[styles.micButton, isProcessing && styles.micButtonDisabled]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              <Feather name="mic" size={48} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Status Text */}
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {isProcessing
              ? 'Processing...'
              : isRecording
              ? 'Listening...'
              : 'Tap to start'}
          </Text>

          {/* Recording Timer */}
          {isRecording && (
            <View style={styles.timerContainer}>
              <View style={styles.recordingDot} />
              <Text style={[styles.timerText, { color: colors.textPrimary }]}>
                {formatDuration(recordingDuration)}
              </Text>
            </View>
          )}

          {/* Recording Instructions */}
          {isRecording && (
            <Text style={[styles.instructionText, { color: colors.textTertiary }]}>
              Tap again to stop
            </Text>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={styles.processingIndicator}
            />
          )}

          {/* Transcription Display */}
          {transcription && !isProcessing ? (
            <View style={styles.transcriptionContainer}>
              <Text style={[styles.transcriptionText, { color: colors.textPrimary }]}>
                "{transcription}"
              </Text>
            </View>
          ) : null}
        </View>)}

        {/* Waveform Animation */}
        {isRecording && candidates.length === 0 && (
          <View style={styles.waveformContainer}>
            {waveformAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    backgroundColor: colors.primary,
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Cancel Button */}
        <Pressable
          style={[styles.cancelButton, { backgroundColor: isDark ? colors.surface : '#F0F0F0' }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelText, { color: colors.textPrimary }]}>Cancel</Text>
        </Pressable>

        <EditExpenseModal
          visible={editModalVisible}
          expense={selectedExpense}
          loading={updateExpenseMutation.isPending}
          onClose={() => {
            if (!updateExpenseMutation.isPending) {
              setEditModalVisible(false);
              setSelectedExpense(null);
            }
          }}
          onSave={handleVoiceEditSave}
        />

        <ConfirmModal
          visible={deleteModalVisible}
          title="Delete Expense?"
          message={
            selectedExpense
              ? `${
                  selectedExpense.note ||
                  selectedExpense.category
                }\n$${Number(
                  selectedExpense.amount
                ).toFixed(2)} • ${new Date(
                  `${selectedExpense.date}T00:00:00`
                ).toLocaleDateString()}`
              : ''
          }
          confirmText="Delete"
          cancelText="Cancel"
          icon="trash-2"
          destructive
          loading={deleteExpenseMutation.isPending}
          onConfirm={handleVoiceDelete}
          onCancel={() => {
            if (!deleteExpenseMutation.isPending) {
              setDeleteModalVisible(false);
              setSelectedExpense(null);
            }
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  ripple: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  rippleOuter: {
    width: 300,
    height: 300,
  },
  rippleMiddle: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xl,
  },
  processingIndicator: {
    marginVertical: SPACING.lg,
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  transcriptionContainer: {
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
  },
  transcriptionText: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  waveformBar: {
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  cancelButton: {
    marginHorizontal: SPACING.xxl,
    marginBottom: SPACING.xxl,
    paddingVertical: SPACING.lg,
    backgroundColor: '#F0F0F0',
    borderRadius: 100,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  candidateSection: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },

  candidateHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  candidateTitle: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  candidateMessage: {
    fontSize: TYPOGRAPHY.fontSize.body,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.sm,
  },

  candidateList: {
    flex: 1,
  },

  candidateListContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },

  candidateCard: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  candidateCardPressed: {
    opacity: 0.65,
  },

  candidateInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },

  candidateNote: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 6,
  },

  candidateMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  candidateMetaText: {
    fontSize: 13,
  },

  candidateRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  candidateAmount: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  tryAgainButton: {
    minHeight: 48,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,

    borderWidth: 1,
    borderRadius: 100,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  tryAgainText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
