import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "@/src/constants/theme";

import { useAuth } from "@/src/contexts/AuthContext";
import { isValidEmail } from "@/src/utils/validation";

export default function LoginScreen() {
  const router = useRouter();

  const { signIn, signInGoogle, forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Input references
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);

      await signIn(email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      await signInGoogle();
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "Failed to sign in with Google"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert("Enter Email", "Please enter your email address first");

      return;
    }

    Alert.alert("Reset Password", `Send password reset email to ${email}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Send",

        onPress: async () => {
          try {
            await forgotPassword(email);

            Alert.alert(
              "Success",
              "Password reset email sent! Check your inbox."
            );
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send reset email");
          }
        },
      },
    ]);
  };

  const handleCreateAccount = () => {
    router.push("/(auth)/signup");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="shield" size={32} color={COLORS.textPrimary} />
          </View>

          <Text style={styles.title}>Trackzy</Text>

          <Text style={styles.subtitle}>
            Secure access to your trusted{"\n"}
            expense tracker.
          </Text>
        </View>

        <View style={styles.form}>
          {/* EMAIL */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>

            <Pressable onPress={() => emailInputRef.current?.focus()}>
              <View style={styles.inputWrapper}>
                <Feather
                  name="mail"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />

                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </Pressable>
          </View>

          {/* PASSWORD */}

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>

              <Pressable onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => passwordInputRef.current?.focus()}>
              <View style={styles.inputWrapper}>
                <Feather
                  name="lock"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />

                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </Pressable>
              </View>
            </Pressable>
          </View>

          <Pressable
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />

            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>

            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Feather name="chrome" size={20} color="#4285F4" />

            <Text style={styles.googleButtonText}>Google</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>

          <Pressable onPress={handleCreateAccount}>
            <Text style={styles.createAccountText}>Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  forgotText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  loginButton: {
    backgroundColor: COLORS.textPrimary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  googleButtonText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textSecondary,
  },
  createAccountText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
