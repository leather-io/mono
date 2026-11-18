import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import { createMoneyFromDecimal } from '@leather.io/utils';

const maximumStacksFee = new BigNumber('18446744073709551615');

interface CustomStacksFeeResult {
  fee?: Money;
  error?: string;
}

export function getCustomStacksFee(input: string, minimumFee?: Money): CustomStacksFeeResult {
  const value = input.trim();
  if (!value) return {};
  const decimal = new BigNumber(value);
  if (
    !/^(\d+\.?\d*|\.\d+)$/.test(value) ||
    !decimal.isFinite() ||
    decimal.lte(0) ||
    (decimal.decimalPlaces() ?? 0) > STX_DECIMALS
  ) {
    return { error: 'Enter a positive fee with up to 6 decimal places' };
  }
  const fee = createMoneyFromDecimal(decimal, 'STX', STX_DECIMALS);
  if (fee.amount.gt(maximumStacksFee)) return { error: 'Fee is too large' };
  if (!minimumFee) return {};
  if (fee.amount.lt(minimumFee.amount)) {
    return {
      error: `Fee must be at least ${minimumFee.amount.shiftedBy(-STX_DECIMALS).toFixed()} STX`,
    };
  }
  return { fee };
}

export function getStacksProposalFeeBalanceError(
  fee: Money | undefined,
  amount: Money | undefined,
  stxBalance: Money | undefined,
  isTokenTransfer: boolean
): string | undefined {
  if (!fee || !amount || !stxBalance) return undefined;
  const total = isTokenTransfer ? fee.amount : fee.amount.plus(amount.amount);
  if (total.gt(stxBalance.amount)) return 'Insufficient STX balance to cover the network fee';
  return undefined;
}
