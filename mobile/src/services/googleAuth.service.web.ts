import {
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";

import { auth } from "@/src/config/firebase";
import apiClient, { endpoints } from '@/src/config/api';
import { UserCreate, UserRead } from '@/src/types/api';


export const signInWithGoogleWeb = async (): Promise<User> => {
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