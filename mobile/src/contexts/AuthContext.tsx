import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as authSignOut,
  resetPassword,
} from "@/src/services/auth.service";

import { useGoogleAuth } from "@/src/hooks/useGoogleAuth";

import { AuthContextType } from "@/src/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Firebase initialization state
  const [initializing, setInitializing] = useState(true);

  // Login/logout/reset password loading state
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { signInGoogle: googleSignIn } = useGoogleAuth();

  /**
   * Listen to Firebase authentication state
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setInitializing(false);
      },
      (firebaseError) => {
        console.error("Auth state change error:", firebaseError);

        setError(firebaseError.message);
        setInitializing(false);
      }
    );

    return unsubscribe;
  }, []);

  /**
   * Email/password signup
   */
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      await signUpWithEmail(name, email, password);
      await signOut();
      setUser(null);

      // user state updates through onAuthStateChanged
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create account";

      setError(errorMessage);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/password login
   */
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      await signInWithEmail(email, password);

      // user state updates through onAuthStateChanged
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in";

      setError(errorMessage);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google login
   * Web:
   *   Firebase signInWithPopup
   *
   * Native:
   *   Expo AuthSession + Firebase credential
   */
  const signInGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      await googleSignIn();

      // user state updates through onAuthStateChanged
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in with Google";

      setError(errorMessage);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);

      await authSignOut();

      // user becomes null through onAuthStateChanged
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign out";

      setError(errorMessage);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Password reset
   */
  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);

      await resetPassword(email);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset email";

      setError(errorMessage);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,

    // expose combined loading state
    loading: initializing || loading,

    error,

    signUp,

    signIn,

    signInGoogle,

    signOut,

    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
