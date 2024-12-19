import { TransactionEventFungibleAsset } from '@stacks/stacks-blockchain-api-types';
import { BigNumber } from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { StacksTx, StacksTxStatus } from '@leather.io/models';
import { microStxToStx } from '@leather.io/utils';
import { abbreviateNumber } from '@leather.io/utils';

// from Extension
export const statusFromTx = (tx: StacksTx): StacksTxStatus => {
  const { tx_status } = tx;
  if (tx_status === 'pending') return 'pending';
  if (tx_status === 'success') return 'success';
  return 'failed';
};

// from Extension txValue

export const stacksValue = ({
  value,
  fixedDecimals = true,
  withTicker = true,
  abbreviate = false,
}: {
  value: number | string | BigNumber;
  fixedDecimals?: boolean;
  withTicker?: boolean;
  abbreviate?: boolean;
}) => {
  const stacks = microStxToStx(value);
  const stxAmount = stacks.toNumber();
  return `${
    abbreviate && stxAmount > 10000
      ? abbreviateNumber(stxAmount)
      : stxAmount.toLocaleString('en-US', {
          maximumFractionDigits: fixedDecimals ? STX_DECIMALS : 3,
        })
  }${withTicker ? ' STX' : ''}`;
};

const getAssetTransfer = (tx: StacksTx): TransactionEventFungibleAsset | null => {
  if (tx.tx_type !== 'contract_call') return null;
  if (tx.tx_status !== 'success') return null;
  const transfer = tx.events.find(event => event.event_type === 'fungible_token_asset');
  if (transfer?.event_type !== 'fungible_token_asset') return null;
  return transfer;
};
// PETE this should probably just return a Money object or null
export const getTxValue = (tx: StacksTx, isOriginator: boolean): number | string | null => {
  if (tx.tx_type === 'token_transfer') {
    console.log('tx.token_transfer.amount', tx.token_transfer.amount);
    return `${isOriginator ? '-' : ''}${stacksValue({
      value: tx.token_transfer.amount,
      withTicker: false,
    })}`;
  }
  const transfer = getAssetTransfer(tx);
  if (transfer) return new BigNumber(transfer.asset.amount).toFormat();
  return null;
};

export function isPendingTx(tx: StacksTx) {
  return tx.tx_status === 'pending';
}
