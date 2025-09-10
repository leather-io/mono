import { detectLanguage } from '@/i18n/detect-language';
import { RootState } from '@/store';
import { Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { initializeAccount } from '../accounts/accounts';
import { SettingsState } from './utils';

export function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: RootState | undefined;
} {
  return action.type === REHYDRATE;
}

export function handleSettingsRehydration(state: any, action: Action): SettingsState {
  if (!isHydrateAction(action)) return state;

  // Setup currentAccount if user has accounts in storage but doesn't have currentAccount preselected
  const potentialFirstAccount = Object.values(action.payload?.accounts.entities ?? {})[0];
  const firstAccountFromRehydrationList = potentialFirstAccount
    ? initializeAccount(potentialFirstAccount)
    : null;

  const currentAccount = action.payload?.settings.currentAccount ?? firstAccountFromRehydrationList;

  const languagePreference =
    action.payload?.settings.languagePreferenceSource !== 'user-selection'
      ? detectLanguage()
      : action.payload?.settings.languagePreference;

  return {
    ...state,
    ...action.payload?.settings,
    languagePreference,
    currentAccount,
  };
}
