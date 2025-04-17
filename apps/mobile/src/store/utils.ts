import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { EntityState, PayloadAction, ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import z from 'zod';

import { isDefined } from '@leather.io/utils';

import { AccountIcon, AccountStore, accountIcons } from './accounts/utils';
import type { RootState, StoreDispatch } from './index';

export function filterObjectKeys(object: object, keys: string[]) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
}

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, UnknownAction>;

type AppDispatch = StoreDispatch & ((action: AppThunk) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function makeAccountIdentifer(fingerprint: string, accountIndex: number) {
  return [fingerprint, accountIndex].join('/');
}
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

type AdapterMethod<T> = (state: EntityState<T, string>, args: any) => void;

export function handleEntityActionWith<State, Payload, R extends AdapterMethod<State>>(
  adapterMethod: R,
  // Payload selector fn expected to return the value passed to second
  // parameter of the adapter method
  payloadSelector: (
    payload: Payload,
    state: EntityState<State, string>
  ) => Parameters<R>[1]['payload']
) {
  return (state: EntityState<State, string>, action: PayloadAction<Payload>) => {
    const selectedPayload = payloadSelector(action.payload, state);
    adapterMethod(state, selectedPayload);
  };
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function entitySchema<T extends z.ZodTypeAny>(genericEntitySchema: T) {
  return z.object({
    ids: z.array(z.string()),
    entities: z.record(z.string(), genericEntitySchema),
  });
}
