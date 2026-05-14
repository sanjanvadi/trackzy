// Navigation Types for Expo Router

// ============================================================================
// Route Parameters
// ============================================================================

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'voice/listening': undefined;
  'voice/confirmation': {
    transcript: string;
    parsedData?: any;
  };
};

export type AuthStackParamList = {
  'onboarding': undefined;
  'login': undefined;
  'signup': undefined;
};

export type TabsParamList = {
  'index': undefined; // Home/Dashboard
  'history': undefined;
  'insights': undefined;
  'profile': undefined;
};

// ============================================================================
// Screen Props (for type-safe navigation)
// ============================================================================

export interface VoiceConfirmationProps {
  transcript: string;
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
}
