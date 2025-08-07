import { detectLanguage } from '@/i18n/detect-language';
import { RootState } from '@/store';
import { Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

export function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: RootState | undefined;
} {
  return action.type === REHYDRATE;
}

export function handleLanguagePreferenceHydration(state: any, action: Action) {
  if (!isHydrateAction(action)) return state;

  if (action.payload?.settings.languagePreferenceSource !== 'user-selection') {
    return {
      ...state,
      languagePreference: detectLanguage(),
    };
  }

  return state;
}
