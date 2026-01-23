import { StacksAppKeysResponseItem } from '@app/features/ledger/utils/stacks-ledger-utils';

import { RootState } from '../..';
import { generateLedgerChainKeyStorageSlice } from '../ledger-chain-key-storage-generator';

function selectStacksKeysSlice(state: RootState) {
  return state.ledger.stacks;
}

const { slice: stacksKeysSlice, adapter } = generateLedgerChainKeyStorageSlice<
  StacksAppKeysResponseItem & { id: string; fingerprint: string }
>('stacks');

export { stacksKeysSlice };

const selectors = adapter.getSelectors(selectStacksKeysSlice);

export const selectWalletStacksKeys = selectors.selectAll;
