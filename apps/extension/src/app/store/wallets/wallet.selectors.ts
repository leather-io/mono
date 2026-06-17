import { useSelector } from 'react-redux';

import { type WalletStore, walletAdapter } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

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

const unmigratedLegacyLedgerError =
  'Reconnect your Ledger with the Stacks app to finish upgrading your existing wallet, then add Bitcoin.';

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

// Bitcoin keys can't be matched against a legacy `00000000` Stacks-only Ledger's descriptors, so
// block when one exists and the device isn't yet known, instead of risking a duplicate wallet.
export function getUnmigratedLegacyLedgerError(
  walletEntities: ReturnType<typeof selectWalletEntities>,
  fingerprint: string
): string | null {
  const legacyWallet = walletEntities[assumedZeroFingerprint];
  if (legacyWallet?.type === 'ledger' && !walletEntities[fingerprint]) {
    return unmigratedLegacyLedgerError;
  }
  return null;
}

export function useWalletEntities() {
  return useSelector(selectWalletEntities);
}

export function useWallets() {
  return useSelector(selectAllWallets);
}
