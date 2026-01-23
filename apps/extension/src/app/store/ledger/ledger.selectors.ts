import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { extractAccountIndexFromPath } from '@leather.io/crypto';
import { sumNumbers, uniqueArray } from '@leather.io/utils';

import { RootState } from '..';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';
import { selectBitcoinKeychainEntities } from './bitcoin/bitcoin-key.slice';

function selectLedger(state: RootState) {
  return state.ledger;
}

const selectNumberOfLedgerKeysPersisted = createSelector(selectLedger, ledger =>
  sumNumbers(Object.values(ledger).map(chain => Object.keys(chain.entities).length))
);

const selectNumberOfLedgerStacksKeysPersisted = createSelector(selectLedger, ledger =>
  sumNumbers(Object.values(ledger.stacks).map(entities => Object.keys(entities).length))
);

const selectHasLedgerKeys = createSelector(selectNumberOfLedgerKeysPersisted, numOfKeys =>
  numOfKeys.isGreaterThan(0)
);

const selectHasLedgerBitcoinKeys = createSelector(
  [selectBitcoinKeychainEntities, selectCurrentAccount],
  (bitcoinKeychainEntities, currentAccount) => {
    const bitcoinKeysForCurrentWallet = Object.values(bitcoinKeychainEntities || {}).filter(
      key => key?.fingerprint === currentAccount.fingerprint
    );

    const uniqueBitcoinAccountIndices = uniqueArray(
      bitcoinKeysForCurrentWallet
        .map(key => extractAccountIndexFromPath(key.path))
        .filter((index): index is number => index !== null)
    );

    return uniqueBitcoinAccountIndices.includes(currentAccount.accountIndex);
  }
);

const selectHasLedgerStacksKeys = createSelector(
  selectNumberOfLedgerStacksKeysPersisted,
  numOfKeys => numOfKeys.isGreaterThan(0)
);

export function useHasLedgerKeys() {
  return useSelector(selectHasLedgerKeys);
}

export function useHasLedgerBitcoinKeys() {
  return useSelector(selectHasLedgerBitcoinKeys);
}

export function useHasLedgerStacksKeys() {
  return useSelector(selectHasLedgerStacksKeys);
}
