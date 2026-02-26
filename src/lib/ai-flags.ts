'use server';

import { db } from './firebase-admin';

export type AiFeature = 
  | 'isUrlSlugGenerationEnabled'
  | 'isWeatherForecastEnabled'
  | 'isPostGenerationEnabled'
  | 'isTopicSuggestionEnabled'
  | 'isMagazineGenerationEnabled'
  | 'isCoverImageGenerationEnabled'
  | 'isAskDianoEnabled';

export type AiFeatureFlags = {
  [key in AiFeature]: boolean;
};

const defaultFlags: AiFeatureFlags = {
  isUrlSlugGenerationEnabled: true,
  isWeatherForecastEnabled: true,
  isPostGenerationEnabled: true,
  isTopicSuggestionEnabled: true,
  isMagazineGenerationEnabled: true,
  isCoverImageGenerationEnabled: true,
  isAskDianoEnabled: true,
};

export async function getAiFeatureFlags(): Promise<AiFeatureFlags> {
  if (!db) return defaultFlags;
  try {
    const doc = await db.collection('ai_settings').doc('feature_flags').get();
    if (!doc.exists) {
      return defaultFlags;
    }
    return { ...defaultFlags, ...doc.data() } as AiFeatureFlags;
  } catch (error: any) {
    // Gracefully handle quota exhaustion and other DB errors
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
        console.warn('Firestore quota exceeded while fetching AI flags. Using default settings.');
    } else {
        console.error('Error fetching AI flags:', error.message);
    }
    return defaultFlags;
  }
}

export async function isAiFeatureEnabled(feature: AiFeature): Promise<boolean> {
    const flags = await getAiFeatureFlags();
    return flags[feature] ?? defaultFlags[feature];
}
