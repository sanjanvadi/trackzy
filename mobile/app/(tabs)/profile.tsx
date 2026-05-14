import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Switch, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleCurrencyChange = () => {
    Alert.alert('Change Currency', 'Currency selection coming soon!');
  };

  const handleBudgetChange = () => {
    Alert.alert('Monthly Budget', 'Budget configuration coming soon!');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trackzy</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={48} color={COLORS.primary} />
            </View>
            <Pressable style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Feather name="edit-2" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.sectionContent}>
            {/* Currency */}
            <Pressable style={styles.menuItem} onPress={handleCurrencyChange}>
              <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="dollar-sign" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>Currency</Text>
                <Text style={styles.menuValue}>USD ($)</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </Pressable>

            {/* Monthly Budget */}
            <Pressable style={styles.menuItem} onPress={handleBudgetChange}>
              <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                <Feather name="credit-card" size={20} color="#9C27B0" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>Monthly Budget</Text>
                <Text style={styles.menuValue}>$4,500.00</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </Pressable>
          </View>
        </View>

        {/* System Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SYSTEM</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            {/* Dark Mode */}
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: '#E0E7FF' }]}>
                <Feather name={isDark ? 'moon' : 'sun'} size={20} color="#6366F1" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.menuSubtext, { color: colors.textSecondary }]}>Switch between light and dark theme</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Push Notifications */}
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
                <Feather name="bell" size={20} color="#FF9800" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>Push Notifications</Text>
                <Text style={styles.menuSubtext}>Alerts for transactions & limits</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Help & Support */}
            <Pressable style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                <Feather name="help-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>Help & Support</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </Pressable>

            {/* About */}
            <Pressable style={[styles.menuItem, styles.lastMenuItem]}>
              <View style={[styles.menuIcon, { backgroundColor: '#FCE4EC' }]}>
                <Feather name="info" size={20} color="#E91E63" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>About</Text>
                <Text style={styles.menuSubtext}>Version 1.0.0</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleSignOut}>
          <Feather name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
  },
  menuSubtext: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFEBEE',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.lg,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
  },
});
