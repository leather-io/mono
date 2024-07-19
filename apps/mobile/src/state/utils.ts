import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EntityState, PayloadAction, ThunkAction, UnknownAction } from '@reduxjs/toolkit';

import { resetWallet } from './global-action';
import { RootState, store } from './index';

export function filterObjectKeys(object: object, keys: string[]) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
}

export async function clearAllPersistedStorage() {
  store.dispatch(resetWallet());
  await AsyncStorage.clear();
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

type AppDispatch = typeof store.dispatch & ((action: AppThunk) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

type AdapterMethod<T> = (state: EntityState<T, string>, ...args: any[]) => void;

export function handleEntityActionWith<T, P>(
  adapterMethod: AdapterMethod<T>,
  selectPayload: (payload: P) => unknown
) {
  return (state: EntityState<T, string>, action: PayloadAction<P>) => {
    const selectedPayload = selectPayload(action.payload);
    adapterMethod(state, selectedPayload);
  };
}

export function makeAccountIdentifer(fingerprint: string, accountIndex: number) {
  return [fingerprint, accountIndex].join('/');
}
