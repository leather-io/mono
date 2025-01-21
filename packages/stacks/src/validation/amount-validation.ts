import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';
import { isDefined, stxToMicroStx } from '@leather.io/utils';

import { StacksError } from './stacks-error';

function isMoneyAmountValid(amount: Money) {
  return amount && isDefined(amount.amount) && amount.amount;
}

interface IsStxAmountValidArgs {
  availableBalance: Money;
  amount: Money;
  fee: Money;
}

export function isStxAmountValid({ availableBalance, amount, fee }: IsStxAmountValidArgs) {
  if (!isMoneyAmountValid(amount)) {
    throw new StacksError('InvalidAmount');
  }
  if (!isMoneyAmountValid(availableBalance)) {
    throw new StacksError('UnknownBalance');
  }
  if (!isMoneyAmountValid(fee)) {
    throw new StacksError('UnknownFee');
  }
  return true;
}

export function isStxBalanceSufficient({
  availableBalance: { amount: availableBalanceAmount },
  amount: { amount: desiredSpend },
  fee: { amount: feeAmount },
}: IsStxAmountValidArgs) {
  const fee = new BigNumber(stxToMicroStx(feeAmount));

  if (!availableBalanceAmount) {
    throw new StacksError('UnknownBalance');
  }
  if (!fee.isFinite()) {
    throw new StacksError('UnknownFee');
  }

  const availableBalance = new BigNumber(stxToMicroStx(availableBalanceAmount));
  const spendableAmount = availableBalance.minus(fee);
  const amount = new BigNumber(stxToMicroStx(desiredSpend));
  return spendableAmount.isGreaterThanOrEqualTo(amount);
}
