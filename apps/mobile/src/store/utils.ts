import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { EntityState, ThunkAction, UnknownAction } from '@reduxjs/toolkit';

import {
  extractAddressIndexFromPath,
  extractFingerprintFromDescriptor,
  makeAccountIdentifer,
} from '@leather.io/crypto';
import { isDefined } from '@leather.io/utils';

import { AccountIcon, AccountStore, accountIcons } from './accounts/utils';
import type { RootState, StoreDispatch } from './index';

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, UnknownAction>;

type AppDispatch = StoreDispatch & ((action: AppThunk) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function destructAccountIdentifier(accountId: string) {
  const [fingerprint, accountIndex, ...rest] = accountId.split('/');
  if (
    fingerprint === undefined ||
    accountIndex === undefined ||
    Number.isNaN(+accountIndex) ||
    rest.length !== 0
  ) {
    throw new Error('Incorrect accountId is passed to destructAccountIdentifier function');
  }

  return { fingerprint, accountIndex: +accountIndex };
}

export function makeStacksAccountIdentiferFromDescriptor(descriptor: string) {
  const accountIdx = extractAddressIndexFromPath(descriptor);
  const accountFingerprint = extractFingerprintFromDescriptor(descriptor);

  return makeAccountIdentifer(accountFingerprint, accountIdx);
}

export function getWalletAccountsByAccountId(
  state: EntityState<AccountStore, string>,
  accountId: string
) {
  const { fingerprint: thisWalletFingerprint } = destructAccountIdentifier(accountId);

  return state.ids
    .filter(id => destructAccountIdentifier(id).fingerprint === thisWalletFingerprint)
    .map(id => state.entities[id])
    .filter(isDefined);
}

export function selectNextDistinctAccountIcon(
  alreadyUsed: AccountIcon[],
  preceding?: AccountIcon
): AccountIcon {
  const isFirstWallet = alreadyUsed.length === 0;
  const defaultFirstWalletIcon: AccountIcon = 'sparkles';

  if (isFirstWallet) return defaultFirstWalletIcon;

  const distinctFromPrevious = accountIcons.filter(icon => icon !== preceding);
  const unused = distinctFromPrevious.filter(icon => !alreadyUsed.includes(icon));
  const candidates = unused.length > 0 ? unused : distinctFromPrevious;

  return candidates[Math.floor(Math.random() * candidates.length)] ?? defaultFirstWalletIcon;
}
