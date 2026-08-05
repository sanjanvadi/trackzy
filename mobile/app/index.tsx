import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { hasCompletedOnboarding } from "@/src/services/onboarding.service";

export default function Index() {
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const result = await hasCompletedOnboarding();

      setCompleted(result);
    };

    void checkOnboarding();
  }, []);

  if (completed === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={completed ? "/(auth)/login" : "/(auth)/onboarding"} />;
}
