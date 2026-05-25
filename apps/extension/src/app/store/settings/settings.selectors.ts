import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@app/store';

function selectSettings(state: RootState) {
  return state.settings;
}

const selectUserSelectedTheme = createSelector(selectSettings, state => state.userSelectedTheme);

export function useUserSelectedTheme() {
  return useSelector(selectUserSelectedTheme);
}

const selectDismissedMessageIds = createSelector(
  selectSettings,
  state => state.dismissedMessages ?? []
);

export function useDismissedMessageIds() {
  return useSelector(selectDismissedMessageIds);
}

const selectDismissedPromoIndexes = createSelector(
  selectSettings,
  state => state.dismissedPromoIndexes ?? []
);

export function useDismissedPromoIndexes() {
  return useSelector(selectDismissedPromoIndexes);
}

const selectIsPrivateMode = createSelector(selectSettings, state => state.isPrivateMode ?? false);

export function useIsPrivateMode() {
  return useSelector(selectIsPrivateMode);
}

const selectIsNotificationsEnabled = createSelector(
  selectSettings,
  state => state.isNotificationsEnabled ?? false
);

export function useIsNotificationsEnabled() {
  return useSelector(selectIsNotificationsEnabled);
}

const selectNetworkBadgeAlwaysOn = createSelector(
  selectSettings,
  state => state.networkBadgeAlwaysOn ?? false
);

export function useNetworkBadgeAlwaysOn() {
  return useSelector(selectNetworkBadgeAlwaysOn);
}
