import { useSelector } from 'react-redux';

import { walletAdapter } from '@leather.io/state/wallet';

import type { RootState } from '..';

function selectWalletsState(state: RootState) {
  return state.wallets;
}

const walletSelectors = walletAdapter.getSelectors<RootState>(selectWalletsState);

export const selectWalletEntities = walletSelectors.selectEntities;
export const selectAllWallets = walletSelectors.selectAll;

export function useWalletEntities() {
  return useSelector(selectWalletEntities);
}

export function useWallets() {
  return useSelector(selectAllWallets);
}
