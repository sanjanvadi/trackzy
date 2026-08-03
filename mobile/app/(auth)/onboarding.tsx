import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { completeOnboarding } from "@/src/services/onboarding.service";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace("/(auth)/login");
  };

  const handleNext = async () => {
    if (currentPage < 2) {
      const nextPage = currentPage + 1;
      scrollViewRef.current?.scrollTo({ x: nextPage * SCREEN_WIDTH, animated: true });
      setCurrentPage(nextPage);
    } else {
      await completeOnboarding();
      router.replace("/(auth)/login");
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, currentPage === 0 && styles.dotActive]} />
        <View style={[styles.dot, currentPage === 1 && styles.dotActive]} />
        <View style={[styles.dot, currentPage === 2 && styles.dotActive]} />
      </View>

      {/* Scrollable Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {/* Page 1 */}
        <View style={styles.page}>
          <View style={styles.illustrationCard}>
            <LinearGradient colors={['#1e3a8a', '#1e293b']} style={styles.gradient}>
              <View style={styles.illustrationContainer}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
                <View style={styles.personContainer}>
                  <View style={styles.personHead} />
                  <View style={styles.personBody} />
                  <View style={styles.phone} />
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Just say it.</Text>
            <Text style={styles.subtitle}>
              Tap the mic, say what you spent,{'\n'}and we'll handle the rest.
            </Text>
          </View>
        </View>

        {/* Page 2 */}
        <View style={styles.page}>
          <View style={styles.illustrationCard}>
            <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.gradient}>
              <View style={styles.voiceContainer}>
                <View style={styles.voiceBubble}>
                  <Feather name="mic" size={16} color={COLORS.primary} />
                  <Text style={styles.voiceText}>"12 dollars for lunch"</Text>
                </View>
                <View style={styles.arrowDown}>
                  <Feather name="arrow-down" size={20} color="#60A5FA" />
                </View>
                <View style={styles.categoryCard}>
                  <View style={styles.categoryIconBox}>
                    <Feather name="coffee" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>Food & Drink</Text>
                    <Text style={styles.categorySubtext}>Lunch</Text>
                  </View>
                  <Text style={styles.categoryAmount}>$12.00</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>We do the math.</Text>
            <Text style={styles.subtitle}>
              Our AI instantly categorizes your{'\n'}spending so you don't have to.
            </Text>
          </View>
        </View>

        {/* Page 3 */}
        <View style={styles.page}>
          <View style={styles.illustrationCard}>
            <LinearGradient colors={['#F1F5F9', '#E2E8F0']} style={styles.gradient}>
              <View style={styles.receiptContainer}>
                <View style={styles.receipt}>
                  <View style={styles.receiptLines}>
                    <View style={styles.receiptLine} />
                    <View style={styles.receiptLine} />
                    <View style={[styles.receiptLine, { width: '60%' }]} />
                  </View>
                  <View style={styles.checkmarkCircle}>
                    <Feather name="check" size={24} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.settingsIconCircle}>
                  <Feather name="settings" size={20} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Review and Refine.</Text>
            <Text style={styles.subtitle}>
              Voice isn't perfect, but correcting it{'\n'}is. Always verify your transactions{'\n'}before they're saved.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Next/Get Started Button */}
      <Pressable style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentPage === 2 ? 'Get Started →' : 'Next →'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.lg,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 32,
    height: 6,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SPACING.lg,
  },
  illustrationCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  illustrationContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    top: '20%',
    left: '15%',
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    top: '30%',
    right: '20%',
  },
  circle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    bottom: '25%',
    right: '15%',
  },
  personContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  personHead: {
    width: 60,
    height: 70,
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    marginBottom: -10,
  },
  personBody: {
    width: 120,
    height: 140,
    backgroundColor: '#60a5fa',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  phone: {
    position: 'absolute',
    bottom: 30,
    right: -20,
    width: 30,
    height: 50,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#475569',
  },
  voiceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  voiceText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  arrowDown: {
    marginVertical: SPACING.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    width: '90%',
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  categorySubtext: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
  },
  categoryAmount: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  receiptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  receipt: {
    width: 180,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
    transform: [{ perspective: 1000 }, { rotateX: '-5deg' }],
  },
  receiptLines: {
    gap: SPACING.md,
  },
  receiptLine: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '100%',
  },
  checkmarkCircle: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  settingsIconCircle: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
