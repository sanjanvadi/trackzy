import {
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";

import { auth } from "@/src/config/firebase";
import { syncUserWithBackend } from "@/src/services/user.service";
import apiClient, { endpoints } from "@/src/config/api";


export const signInWithGoogleWeb = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result =
    await signInWithPopup(
      auth,
      provider
    );

  const user = result.user;

  try {
    await apiClient.get(endpoints.users.me);
  } catch (error: any) {
    if (error.response?.status === 404) {
      await syncUserWithBackend(user);
    } else {
      throw error;
    }
  }

  return result.user;
};