
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

const settingsDocRef = () => {
    if (!db) return null;
    return db.collection('ai_settings').doc('feature_flags');
}

export async function getAiFeatureFlags(): Promise<AiFeatureFlags> {
  const docRef = settingsDocRef();
  if (!docRef) {
      console.warn('AI-FLAGS: DB not available, returning default flags.');
      return defaultFlags;
  }
  try {
    const doc = await docRef.get();
    if (!doc.exists) {
      // If the document doesn't exist, create it with defaults
      try {
        await docRef.set(defaultFlags);
      } catch (writeError: any) {
        // If even writing fails (e.g., quota), still return defaults
        if (writeError.code === 8) { // RESOURCE_EXHAUSTED
           console.warn(`Firestore quota exceeded while trying to set default AI flags. Returning defaults.`);
        } else {
           console.error('Error setting default AI feature flags:', writeError);
        }
        return defaultFlags;
      }
      return defaultFlags;
    }
    // Merge with defaults to ensure all flags are present even if some are missing from DB
    return { ...defaultFlags, ...doc.data() };
  } catch (error: any) {
    if (error.code === 8) { // RESOURCE_EXHAUSTED
      console.warn(`Firestore quota exceeded when fetching AI flags. Falling back to default flags. Error: ${error.message}`);
    } else {
      console.error('Error fetching AI feature flags:', error);
    }
    return defaultFlags; // Fallback to defaults on any read error
  }
}

export async function isAiFeatureEnabled(feature: AiFeature): Promise<boolean> {
    const flags = await getAiFeatureFlags();
    return flags[feature] ?? false; // Default to false if flag is not defined
}
