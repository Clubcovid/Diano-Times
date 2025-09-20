
'use server';

import { db } from './firebase-admin';

// This is now defined in the component that uses it: ai-feature-form.tsx
// export const AI_FEATURES = { ... }

export type AiFeature = 
  | 'isUrlSlugGenerationEnabled'
  | 'isWeatherForecastEnabled'
  | 'isPostGenerationEnabled'
  | 'isTopicSuggestionEnabled'
  | 'isMagazineGenerationEnabled'
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
      await docRef.set(defaultFlags);
      return defaultFlags;
    }
    // Merge with defaults to ensure all flags are present
    return { ...defaultFlags, ...doc.data() };
  } catch (error) {
    console.error('Error fetching AI feature flags:', error);
    return defaultFlags;
  }
}

export async function isAiFeatureEnabled(feature: AiFeature): Promise<boolean> {
    const flags = await getAiFeatureFlags();
    return flags[feature] ?? false; // Default to false if flag is not defined
}
