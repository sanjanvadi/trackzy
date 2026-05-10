import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  const handleNext = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Progress Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Illustration Card */}
      <View style={styles.illustrationCard}>
        <LinearGradient
          colors={['#1e3a8a', '#1e293b']}
          style={styles.gradient}
        >
          {/* Illustration Placeholder */}
          <View style={styles.illustrationContainer}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />

            {/* Person Icon Placeholder */}
            <View style={styles.personContainer}>
              <View style={styles.personHead} />
              <View style={styles.personBody} />
              <View style={styles.phone} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Just say it.</Text>
        <Text style={styles.subtitle}>
          Tap the mic, say what you spent,{'\n'}and we'll handle the rest.
        </Text>
      </View>

      {/* Next Button */}
      <Pressable style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
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
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 32,
    height: 6,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
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
    marginBottom: SPACING.xl,
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
