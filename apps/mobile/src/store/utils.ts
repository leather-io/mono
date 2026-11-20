import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';

import {
  extractAddressIndexFromPath,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
  makeAccountIdentifer,
  parseAccountIdentifier,
} from '@leather.io/crypto';

import type { RootState, StoreDispatch } from './store';

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, UnknownAction>;

type AppDispatch = StoreDispatch & ((action: AppThunk) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function destructAccountIdentifier(accountId: string) {
  return parseAccountIdentifier(accountId);
}

export function makeStacksAccountIdentiferFromDescriptor(descriptor: string) {
  const accountIdx = extractAddressIndexFromPath(extractKeyOriginPathFromDescriptor(descriptor));
  const accountFingerprint = extractFingerprintFromDescriptor(descriptor);

  return makeAccountIdentifer(accountFingerprint, accountIdx);
}
