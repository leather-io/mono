import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@app/store';

function selectActive(state: RootState) {
  return state.active;
}

export const selectActiveAccount = createSelector(selectActive, state => state.account);

export function useActiveAccount() {
  return useSelector(selectActiveAccount);
}

// export const selectActiveFingerprint = createSelector(
//   selectActive,
//   state => state.account?.fingerprint ?? null
// );

// export function useActiveFingerprint() {
//   return useSelector(selectActiveFingerprint);
// }

// export const selectActiveAccountIndex = createSelector(
//   selectActive,
//   state => state.account?.accountIndex ?? null
// );

// export function useActiveAccountIndex() {
//   return useSelector(selectActiveAccountIndex);
// }

// export const selectHasActiveAccount = createSelector(selectActive, state => {
//   return state.account !== null;
// });

// export function useHasActiveAccount() {
//   return useSelector(selectHasActiveAccount);
// }

// export function selectIsAccountActive(accountId: AccountId) {
//   return createSelector(selectActive, state => {
//     if (!state.account) return false;
//     return (
//       state.account.fingerprint === accountId.fingerprint &&
//       state.account.accountIndex === accountId.accountIndex
//     );
//   });
// }
