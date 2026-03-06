import { useSelector } from 'react-redux';

import { type WalletStore, walletAdapter } from '@leather.io/state/wallet';

import type { RootState } from '..';

function selectWalletsState(state: RootState) {
  return state.wallets;
}

const walletSelectors = walletAdapter.getSelectors<RootState>(selectWalletsState);

export const selectWalletEntities = walletSelectors.selectEntities;
export const selectAllWallets = walletSelectors.selectAll;

const duplicateWalletError = 'A wallet with this Secret Key has already been added to this device.';

const duplicateSeedAcrossWalletTypesError =
  'A wallet with this Secret Key already exists on this device. The same Secret Key cannot be used for both a software wallet and a Ledger wallet.';

export function getAddWalletError(
  walletEntities: ReturnType<typeof selectWalletEntities>,
  fingerprint: string,
  incomingType: WalletStore['type']
): string | null {
  const existingWallet = walletEntities[fingerprint];
  if (!existingWallet) return null;
  if (incomingType === 'ledger' && existingWallet.type === 'ledger') return null;
  if (existingWallet.type !== incomingType) return duplicateSeedAcrossWalletTypesError;
  return duplicateWalletError;
}

export function useWalletEntities() {
  return useSelector(selectWalletEntities);
}

export function useWallets() {
  return useSelector(selectAllWallets);
}
