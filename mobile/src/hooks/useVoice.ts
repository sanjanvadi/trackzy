// Voice hooks - React Query hooks for voice input

import { useMutation } from '@tanstack/react-query';
import { parseVoiceInput } from '@/src/services/voice.service';
import { VoiceParseResponse } from '@/src/types/api';

/**
 * Hook to parse voice input
 * Usage:
 * const parseVoiceMutation = useParseVoice();
 * parseVoiceMutation.mutate(audioUri, {
 *   onSuccess: (data) => console.log(data)
 * });
 */
export const useParseVoice = () => {
  return useMutation<VoiceParseResponse, Error, string>({
    mutationFn: (audioUri: string) => parseVoiceInput(audioUri),
    retry: false, // No retries
  });
};
