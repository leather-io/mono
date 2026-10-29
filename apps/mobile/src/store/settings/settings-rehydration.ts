import { detectLanguage } from '@/i18n/detect-language';
import { type RootState } from '@/store/store';
import { type Action } from '@reduxjs/toolkit';
import { type REHYDRATE } from 'redux-persist';

import { deserializeAccountId } from '../accounts/accounts';
import { type SettingsState } from './utils';

interface SettingsRehydrateAction extends Action<typeof REHYDRATE> {
  key: string;
  payload: RootState | undefined;
}

export function handleSettingsRehydration(
  state: SettingsState,
  action: SettingsRehydrateAction
): SettingsState {
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
