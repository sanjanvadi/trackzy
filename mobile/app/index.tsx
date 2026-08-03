import { hasCompletedOnboarding } from '@/src/services/onboarding.service';
import { Redirect } from 'expo-router';

export default async function Index() {
  const completedOnboarding = await hasCompletedOnboarding();
  if (completedOnboarding) {
    return <Redirect href="/(auth)/login" />;
  }else{
    return <Redirect href="/(auth)/onboarding" />;
  }
}
