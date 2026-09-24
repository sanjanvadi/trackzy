// Voice Service - API calls for voice parsing

import { Platform } from 'react-native';
import apiClient, { endpoints } from '@/src/config/api';
import { VoiceParseResponse } from '@/src/types/api';

/**
 * Upload audio file and parse voice intent
 */
export const parseVoiceInput = async (
  audioUri: string
): Promise<VoiceParseResponse> => {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, Expo gives us a blob URL.
    // Fetch it and convert it to an actual Blob/File for FormData.
    const audioResponse = await fetch(audioUri);

    if (!audioResponse.ok) {
      throw new Error('Failed to read recorded audio');
    }

    const audioBlob = await audioResponse.blob();

    console.log('Web audio blob:', {
      type: audioBlob.type,
      size: audioBlob.size,
    });

    // Determine file extension from MIME type
    let extension = 'webm';

    if (audioBlob.type.includes('ogg')) {
      extension = 'ogg';
    } else if (
      audioBlob.type.includes('mp4') ||
      audioBlob.type.includes('m4a')
    ) {
      extension = 'm4a';
    } else if (audioBlob.type.includes('wav')) {
      extension = 'wav';
    }

    formData.append(
      'audio',
      audioBlob,
      `recording.${extension}`
    );
  } else {
    // React Native Android / iOS
    const fileExtension = audioUri.split('.').pop() || 'm4a';

    // @ts-ignore - React Native FormData accepts uri format
    formData.append('audio', {
      uri: audioUri,
      type: `audio/${fileExtension}`,
      name: `recording.${fileExtension}`,
    });
  }

  const response = await apiClient.post<VoiceParseResponse>(
    endpoints.voice.parse,
    formData,
    {
      // IMPORTANT:
      // Browser must generate multipart boundary automatically.
      headers:
            {
              'Content-Type': 'multipart/form-data',
            },

      timeout: 60000,
    }
  );

  return response.data;
};