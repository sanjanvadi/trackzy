import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import { useDefaultLedger } from '@/src/hooks/useLedgers';
import { useCreateExpense } from '@/src/hooks/useExpenses';
import { Category } from '@/src/types/api';
import { categoryIcons, categoryLabels, categories } from '@/src/constants/categories';
import { formatDateTime } from '@/src/utils/date';

export default function VoiceConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  // For now, using mock data - will receive from backend later
  const mockTranscript = params.transcript as string || "I spent 12 dollars on lunch";
  const mockAmount = params.amount as string || "12.00";
  const mockCategory = params.category as Category || "food";
  const mockNote = params.note as string || "Lunch";

  const [amount, setAmount] = useState(mockAmount);
  const [category, setCategory] = useState<Category>(mockCategory);
  const [note, setNote] = useState(mockNote);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { data: defaultLedger } = useDefaultLedger();
  const createExpenseMutation = useCreateExpense();

  const handleConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!defaultLedger) {
      Alert.alert('Error', 'No ledger found');
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        ledgerId: defaultLedger.id,
        data: {
          amount: parseFloat(amount),
          category,
          note,
          date: new Date().toISOString(),
          source: 'voice',
        },
      });

      Alert.alert(
        'Success!',
        'Your expense has been added.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create expense');
    }
  };

  const handleReRecord = () => {
    router.back();
  };

  const getCategoryIcon = (cat: Category) => {
    const iconMap: Record<Category, string> = {
      food: 'coffee',
      transport: 'truck',
      shopping: 'shopping-bag',
      health: 'heart',
      entertainment: 'film',
      bills: 'file-text',
      grocery: 'shopping-cart',
      other: 'package',
    };
    return iconMap[cat] || 'package';
  };

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={[styles.successIcon, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#E3F2FD' }]}>
              <Feather name="check" size={32} color={colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Parsed Successfully</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Review and confirm your transaction details.
          </Text>

          {/* Transcript Display */}
          <View style={[styles.transcriptBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#E3F2FD' }]}>
            <Feather name="mic" size={20} color={colors.primary} />
            <Text style={[styles.transcriptText, { color: colors.textPrimary }]}>"{mockTranscript}"</Text>
          </View>

          {/* Amount Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Amount</Text>
            <View style={[styles.amountInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>$</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.textPrimary }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          {/* Category Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Category</Text>
            <Pressable
              style={[styles.categorySelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <View style={styles.categoryLeft}>
                <Feather
                  name={getCategoryIcon(category) as any}
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.categoryText, { color: colors.textPrimary }]}>{categoryLabels[category]}</Text>
              </View>
              <Feather name="chevron-down" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Description</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Date</Text>
            <View style={[styles.dateDisplay, { backgroundColor: isDark ? colors.surface : '#F5F7FA' }]}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDateTime(new Date().toISOString())}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <Pressable
            style={[styles.confirmButton, { backgroundColor: colors.textPrimary }, createExpenseMutation.isPending && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={createExpenseMutation.isPending}
          >
            {createExpenseMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirm Transaction</Text>
              </>
            )}
          </Pressable>

          {/* Re-record Button */}
          <Pressable style={[styles.reRecordButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={handleReRecord}>
            <Feather name="mic" size={20} color={colors.primary} />
            <Text style={[styles.reRecordButtonText, { color: colors.primary }]}>Re-record</Text>
          </Pressable>
        </ScrollView>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>Select Category</Text>
                <Pressable onPress={() => setShowCategoryPicker(false)}>
                  <Feather name="x" size={24} color={colors.textPrimary} />
                </Pressable>
              </View>
              <ScrollView>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.categoryOption, { borderBottomColor: isDark ? colors.border : '#F5F5F5' }]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={styles.categoryOptionLeft}>
                      <Feather
                        name={getCategoryIcon(cat) as any}
                        size={24}
                        color={colors.primary}
                      />
                      <Text style={[styles.categoryOptionText, { color: colors.textPrimary }]}>
                        {categoryLabels[cat]}
                      </Text>
                    </View>
                    {category === cat && (
                      <Feather name="check" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  transcriptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#E3F2FD',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  transcriptText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: SPACING.lg,
    height: 64,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: SPACING.lg,
    height: 64,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    height: 64,
  },
  dateDisplay: {
    backgroundColor: '#F5F7FA',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    height: 64,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  reRecordButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  categoryOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  categoryOptionText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
  },
});
