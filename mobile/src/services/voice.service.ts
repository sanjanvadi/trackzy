// Voice Service - API calls for voice parsing

import apiClient, { endpoints } from '@/src/config/api';
import { VoiceParseResponse } from '@/src/types/api';

/**
 * Upload audio file and parse voice intent
 */
export const parseVoiceInput = async (
  audioUri: string
): Promise<VoiceParseResponse> => {
  // Create form data
  const formData = new FormData();

  // Extract file extension from URI
  const fileExtension = audioUri.split('.').pop() || 'm4a';

  // Append audio file
  // @ts-ignore - React Native FormData accepts uri format
  formData.append('audio', {
    uri: audioUri,
    type: `audio/${fileExtension}`,
    name: `recording.${fileExtension}`,
  });

  const response = await apiClient.post<VoiceParseResponse>(
    endpoints.voice.parse,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for transcription + LLM
    }
  );

  return response.data;
};
