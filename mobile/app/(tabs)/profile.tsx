import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem}>
            <Feather name="settings" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Settings</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Feather name="credit-card" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Ledgers</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <Feather name="help-circle" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
          </Pressable>

          <Pressable style={[styles.menuItem, styles.signOutItem]} onPress={handleSignOut}>
            <Feather name="log-out" size={20} color={COLORS.error} />
            <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: COLORS.error,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
