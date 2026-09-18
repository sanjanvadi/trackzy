// src/services/userSync.service.ts

import apiClient, { endpoints } from "@/src/config/api";
import { User, deleteUser, updateProfile } from "firebase/auth";
import { UserCreate, UserRead, UserUpdate } from "@/src/types/api";

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

export const getUser = async (user: User): Promise<UserRead> => {
  try {
    const response = await apiClient.get<UserRead>(endpoints.users.me);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

export const updateUser = async (
  user: User,
  data: UserUpdate
): Promise<UserRead> => {
  try {
    // Update backend user
    const response =
      await apiClient.patch<UserRead>(
        endpoints.users.update,
        data
      );

    // Keep Firebase displayName in sync
    if (
      data.name !== undefined &&
      data.name !== user.displayName
    ) {
      await updateProfile(user, {
        displayName: data.name,
      });
    }

    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to update user:",
      error
    );

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
