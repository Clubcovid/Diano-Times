
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
    // Silently handle database errors to prevent build crashes or disruptive UI overlays
    return defaultFlags;
  }
}

export async function isAiFeatureEnabled(feature: AiFeature): Promise<boolean> {
    try {
        const flags = await getAiFeatureFlags();
        return flags[feature] ?? defaultFlags[feature];
    } catch (e) {
        return defaultFlags[feature];
    }
}
