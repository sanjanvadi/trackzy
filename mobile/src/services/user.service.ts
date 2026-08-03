// src/services/userSync.service.ts

import apiClient, { endpoints } from "@/src/config/api";
import { User, deleteUser } from "firebase/auth";
import { UserCreate, UserRead } from "@/src/types/api";

export const syncUserWithBackend = async (user: User): Promise<UserRead> => {
  try {

    const userData: UserCreate = {
      name: user.displayName || "User",
      email: user.email!,
      currency: "USD",
    };
  
    const response = await apiClient.post<UserRead>(
      endpoints.users.register,
      userData
    );
  
    return response.data;
  } catch (error:any) {
    console.error("Error syncing user with backend:", error);
    throw error;
  }
};

export const deleteAccount = async (user: User): Promise<void> => {
  try {
    await apiClient.delete(endpoints.users.delete);

    await deleteUser(user);
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Backend user does not exist
      // Only delete Firebase user
      await deleteUser(user);
    } else {
      console.error("Failed to delete account:", error);

      throw error;
    }
  }
};
