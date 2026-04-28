import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { UserSelectedTheme } from '@app/common/theme-provider';

interface InitialState {
  userSelectedTheme: UserSelectedTheme;
  dismissedMessages: string[];
  dismissedPromoIndexes: number[];
  seenFeatureIntros: string[];
  customAccountNames: Record<string, string>;
  hiddenAccounts: string[];
  isPrivateMode?: boolean;
  isNotificationsEnabled?: boolean;
  bypassInscriptionChecks?: boolean;
  discardedInscriptions: string[];
  networkBadgeAlwaysOn?: boolean;
}

function accountKey(fingerprint: string, accountIndex: number) {
  return `${fingerprint}:${accountIndex}`;
}

const initialState: InitialState = {
  userSelectedTheme: 'system',
  dismissedMessages: [],
  dismissedPromoIndexes: [],
  seenFeatureIntros: [],
  customAccountNames: {},
  hiddenAccounts: [],
  discardedInscriptions: [],
  isNotificationsEnabled: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUserSelectedTheme(state, action: PayloadAction<UserSelectedTheme>) {
      state.userSelectedTheme = action.payload;
    },
    messageDismissed(state, action: PayloadAction<string>) {
      if (!Array.isArray(state.dismissedMessages)) state.dismissedMessages = [];
      state.dismissedMessages = [...state.dismissedMessages, action.payload];
    },
    resetMessages(state) {
      state.dismissedMessages = [];
    },
    promoDismissed(state, action: PayloadAction<number>) {
      if (!Array.isArray(state.dismissedPromoIndexes)) state.dismissedPromoIndexes = [];
      state.dismissedPromoIndexes = [...state.dismissedPromoIndexes, action.payload];
    },
    resetPromoBanner(state) {
      state.dismissedPromoIndexes = [];
    },
    featureIntroSeen(state, action: PayloadAction<string>) {
      if (!Array.isArray(state.seenFeatureIntros)) state.seenFeatureIntros = [];
      if (!state.seenFeatureIntros.includes(action.payload)) {
        state.seenFeatureIntros = [...state.seenFeatureIntros, action.payload];
      }
    },
    resetFeatureIntros(state) {
      state.seenFeatureIntros = [];
    },
    togglePrivateMode(state) {
      state.isPrivateMode = !state.isPrivateMode;
    },
    toggleNotificationsEnabled(state) {
      state.isNotificationsEnabled = !state.isNotificationsEnabled;
    },
    toggleNetworkBadgeAlwaysOn(state) {
      state.networkBadgeAlwaysOn = !state.networkBadgeAlwaysOn;
    },
    dangerouslyChosenToBypassAllInscriptionChecks(state) {
      state.bypassInscriptionChecks = true;
    },
    discardInscriptions(state, action: PayloadAction<string[]>) {
      if (!Array.isArray(state.discardedInscriptions)) state.discardedInscriptions = [];
      state.discardedInscriptions.push(...action.payload);
    },
    recoverInscriptions(state, action: PayloadAction<string[]>) {
      const ids = new Set(action.payload);
      state.discardedInscriptions = state.discardedInscriptions.filter(id => !ids.has(id));
    },
    resetInscriptionState(state) {
      state.discardedInscriptions = [];
    },
    setAccountName(
      state,
      action: PayloadAction<{ fingerprint: string; accountIndex: number; name: string }>
    ) {
      const { fingerprint, accountIndex, name } = action.payload;
      if (!state.customAccountNames) state.customAccountNames = {};
      state.customAccountNames[accountKey(fingerprint, accountIndex)] = name;
    },
    toggleAccountHidden(
      state,
      action: PayloadAction<{ fingerprint: string; accountIndex: number }>
    ) {
      const { fingerprint, accountIndex } = action.payload;
      if (!Array.isArray(state.hiddenAccounts)) state.hiddenAccounts = [];
      const key = accountKey(fingerprint, accountIndex);
      const idx = state.hiddenAccounts.indexOf(key);
      if (idx === -1) {
        state.hiddenAccounts.push(key);
      } else {
        state.hiddenAccounts.splice(idx, 1);
      }
    },
  },
});
