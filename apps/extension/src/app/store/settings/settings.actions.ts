import { useDispatch } from 'react-redux';

import { settingsSlice } from './settings.slice';

export const settingsActions = settingsSlice.actions;

export function useDismissMessage() {
  const dispatch = useDispatch();
  return (messageId: string) => dispatch(settingsActions.messageDismissed(messageId));
}

export function useTogglePrivateMode() {
  const dispatch = useDispatch();
  return () => dispatch(settingsActions.togglePrivateMode());
}

export function useToggleNotificationsEnabled() {
  const dispatch = useDispatch();
  return () => dispatch(settingsActions.toggleNotificationsEnabled());
}

export function useToggleNetworkBadgeAlwaysOn() {
  const dispatch = useDispatch();
  return () => dispatch(settingsActions.toggleNetworkBadgeAlwaysOn());
}

// ts-unused-exports:disable-next-line
export function useToggleStacksAccountDerivationPreference() {
  const dispatch = useDispatch();
  return () => dispatch(settingsActions.toggleStacksAccountDerivationPreference());
}
