// Authentication Types

import { User } from 'firebase/auth';

// ============================================================================
// Auth State
// ============================================================================

export interface AuthState {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

// ============================================================================
// Auth Forms
// ============================================================================

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

// ============================================================================
// Auth Context
// ============================================================================

export interface AuthContextType extends AuthState {
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}
