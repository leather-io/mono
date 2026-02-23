import { detectLanguage } from '@/i18n/detect-language';
import { RootState } from '@/store';
import { Action } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { deserializeAccountId } from '../accounts/accounts';
import { SettingsState } from './utils';

function isHydrateAction(action: Action): action is Action<typeof REHYDRATE> & {
  key: string;
  payload: RootState | undefined;
} {
  return action.type === REHYDRATE;
}

export function handleSettingsRehydration(state: any, action: Action): SettingsState {
  if (!isHydrateAction(action)) return state;

  const firstAccountId = action.payload?.accounts.ids?.[0];
  const firstAccountFromRehydration = firstAccountId ? deserializeAccountId(firstAccountId) : null;

  const currentAccount = action.payload?.settings.currentAccount ?? firstAccountFromRehydration;

  const languagePreference =
    action.payload?.settings.languagePreferenceSource !== 'user-selection'
      ? detectLanguage()
      : action.payload?.settings.languagePreference;

  return {
    ...state,
    ...action.payload?.settings,
    hapticsPreference: action.payload?.settings.hapticsPreference ?? state.hapticsPreference,
    notificationsPreference:
      action.payload?.settings.notificationsPreference ?? state.notificationsPreference,
    assetVisibility: action.payload?.settings.assetVisibility ?? state.assetVisibility,
    languagePreference,
    currentAccount,
  };
}
