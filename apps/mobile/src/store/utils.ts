import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { ThunkAction, UnknownAction } from '@reduxjs/toolkit';

import {
  extractAddressIndexFromPath,
  extractFingerprintFromDescriptor,
  makeAccountIdentifer,
} from '@leather.io/crypto';

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
