import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import type { InscriptionAsset } from '@leather.io/models';
import { ensureArray } from '@leather.io/utils';

import { useCurrentAccountInscriptions } from '@app/query/bitcoin/ordinals/inscriptions/inscriptions.query';
import { RootState } from '@app/store';

import { settingsSlice } from './settings.slice';

function selectSettings(state: RootState) {
  return state.settings;
}

const selectUserSelectedTheme = createSelector(selectSettings, state => state.userSelectedTheme);

export function useUserSelectedTheme() {
  return useSelector(selectUserSelectedTheme);
}

const selectDismissedMessageIds = createSelector(
  selectSettings,
  state => state.dismissedMessages ?? []
);

export function useDismissedMessageIds() {
  return useSelector(selectDismissedMessageIds);
}

const selectDismissedPromoIndexes = createSelector(
  selectSettings,
  state => state.dismissedPromoIndexes ?? []
);

export function useDismissedPromoIndexes() {
  return useSelector(selectDismissedPromoIndexes);
}

const selectIsPrivateMode = createSelector(selectSettings, state => state.isPrivateMode ?? false);

export function useIsPrivateMode() {
  return useSelector(selectIsPrivateMode);
}

const selectIsNotificationsEnabled = createSelector(
  selectSettings,
  state => state.isNotificationsEnabled ?? false
);

export function useIsNotificationsEnabled() {
  return useSelector(selectIsNotificationsEnabled);
}

const selectNetworkBadgeAlwaysOn = createSelector(
  selectSettings,
  state => state.networkBadgeAlwaysOn ?? false
);

export function useNetworkBadgeAlwaysOn() {
  return useSelector(selectNetworkBadgeAlwaysOn);
}

const selectSeenFeatureIntros = createSelector(
  selectSettings,
  state => state.seenFeatureIntros ?? []
);

export function useSeenFeatureIntros() {
  return useSelector(selectSeenFeatureIntros);
}

export function useHasSeenFeature(featureId: string) {
  const seenFeatureIntros = useSeenFeatureIntros();
  return seenFeatureIntros.includes(featureId);
}

const selectDiscardedInscriptions = createSelector(
  selectSettings,
  state => state.discardedInscriptions
);

type InscriptionIdentifier = Pick<InscriptionAsset, 'txid' | 'output' | 'offset'>;

export function useDiscardedInscriptions() {
  return useSelector(selectDiscardedInscriptions);
}

export function useCurrentAccountDiscardedInscriptions() {
  const discardedInscriptions = useSelector(selectDiscardedInscriptions);
  const dispatch = useDispatch();
  const currentAccountInscriptions = useCurrentAccountInscriptions();

  function makeInscriptionId({ txid, output: vout, offset }: InscriptionIdentifier) {
    return [txid, vout, offset].join(':');
  }

  return useMemo(
    () => ({
      inscriptions: currentAccountInscriptions.inscriptions,
      discardedInscriptions,
      hasInscriptionBeenDiscarded(inscription: InscriptionIdentifier) {
        return discardedInscriptions.includes(makeInscriptionId(inscription));
      },
      discardInscriptions(inscription: InscriptionIdentifier | InscriptionIdentifier[]) {
        dispatch(
          settingsSlice.actions.discardInscriptions(ensureArray(inscription).map(makeInscriptionId))
        );
      },
      recoverInscriptions(inscription: InscriptionIdentifier | InscriptionIdentifier[]) {
        dispatch(
          settingsSlice.actions.recoverInscriptions(ensureArray(inscription).map(makeInscriptionId))
        );
      },
    }),
    [currentAccountInscriptions.inscriptions, discardedInscriptions, dispatch]
  );
}
