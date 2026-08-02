// Firebase Authentication Service

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import apiClient, { endpoints } from '@/src/config/api';
import { UserCreate, UserRead } from '@/src/types/api';

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  // Create Firebase user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, { displayName: name });

  // Create user in backend
  const userData: UserCreate = {
    name,
    email,
    currency: 'USD',
  };

  try {
    await apiClient.post<UserRead>(endpoints.users.register, userData);
    console.log('User created in backend:', email);
  } catch (error) {
    console.error('Failed to create user in backend:', error);
    // Don't throw - user is created in Firebase, backend sync can retry later
  }

  return user;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign in with Google
 
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  // Check if user exists in backend, if not create
  try {
    await apiClient.get<UserRead>(endpoints.users.me);
  } catch (error: any) {
    if (error.response?.status === 404) {
      // User doesn't exist in backend, create
      const userData: UserCreate = {
        name: user.displayName || 'User',
        email: user.email!,
        currency: 'USD',
      };
      await apiClient.post<UserRead>(endpoints.users.register, userData);
    }
  }

  return user;
};
*/
/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Get current user's Firebase ID token
 */
export const getCurrentUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
