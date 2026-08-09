import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { UserSelectedTheme } from '@app/common/theme-provider';

interface InitialState {
  userSelectedTheme: UserSelectedTheme;
  dismissedMessages: string[];
  dismissedPromoIndexes: number[];
  seenFeatureIntros: string[];
  isPrivateMode?: boolean;
  isNotificationsEnabled?: boolean;
  isSidePanelModeEnabled?: boolean;
  bypassInscriptionChecks?: boolean;
  discardedInscriptions: string[];
  networkBadgeAlwaysOn?: boolean;
}

const initialState: InitialState = {
  userSelectedTheme: 'system',
  dismissedMessages: [],
  dismissedPromoIndexes: [],
  seenFeatureIntros: [],
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
    toggleSidePanelMode(state) {
      state.isSidePanelModeEnabled = !(state.isSidePanelModeEnabled ?? true);
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
  },
});
