import { createAction } from '@reduxjs/toolkit';

export const resetWallet = createAction('global/resetWallet');

// Helper function to be called within a slice's `extraReducers.addCase` method
export function handleAppResetWithState<T>(state: T) {
  return [resetWallet, () => state] as const;
}
