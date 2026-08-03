import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "onboarding_completed";

export const hasCompletedOnboarding = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === "true";
};

export const completeOnboarding = async (): Promise<void> => {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
};

// Optional - useful during development
export const resetOnboarding = async (): Promise<void> => {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
};