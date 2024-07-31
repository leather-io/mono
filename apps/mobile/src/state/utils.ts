import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EntityState, PayloadAction, ThunkAction, UnknownAction } from '@reduxjs/toolkit';

import { resetWallet } from './global-action';
import { RootState, store } from './index';
import { deleteAllMnemonics } from './storage-persistors';

export function filterObjectKeys(object: object, keys: string[]) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
}

export async function clearAllPersistedStorage(fingerprints: string[]) {
  await deleteAllMnemonics(fingerprints);
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

export function makeAccountIdentifer(fingerprint: string, accountIndex: number) {
  return [fingerprint, accountIndex].join('/');
}

type AdapterMethod<T> = (state: EntityState<T, string>, args: any) => void;

export function handleEntityActionWith<State, Payload, R extends AdapterMethod<State>>(
  adapterMethod: R,
  // Payload selector fn expected to return the value passsed to second
  // parameter of the adapter method
  payloadSelector: (payload: Payload) => Parameters<R>[1]['payload']
) {
  return (state: EntityState<State, string>, action: PayloadAction<Payload>) => {
    const selectedPayload = payloadSelector(action.payload);
    adapterMethod(state, selectedPayload);
  };
}
