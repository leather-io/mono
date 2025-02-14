import BigNumber from 'bignumber.js';
import { z } from 'zod';

import { BitcoinAddress, type BitcoinNetworkModes } from '@leather.io/models';
import { FormErrorMessages, btcToSat, satToBtc } from '@leather.io/utils';

import { calculateMaxSpend } from '../coin-selection/calculate-max-spend';
import { GetBitcoinFeesArgs } from '../fees/bitcoin-fees';
import { BitcoinError } from '../validation/bitcoin-error';
import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from './address-validation';

const minSpendAmountInSats = 546;

interface BitcoinTransaction extends Omit<GetBitcoinFeesArgs, 'recipients'> {
  amount: number;
  payer: BitcoinAddress;
  recipient: BitcoinAddress;
  network: BitcoinNetworkModes;
  feeRate: number;
}

export function isValidBitcoinTransaction({
  amount,
  payer,
  recipient,
  network,
  utxos,
  feeRate,
  feeRates,
}: BitcoinTransaction) {
  if (!isValidBitcoinAddress(payer) || !isValidBitcoinAddress(recipient)) {
    throw new BitcoinError('InvalidAddress');
  }
  if (
    !isValidBitcoinNetworkAddress(payer, network) ||
    !isValidBitcoinNetworkAddress(recipient, network)
  ) {
    throw new BitcoinError('InvalidNetworkAddress');
  }

  const { spendableBtc } = calculateMaxSpend({ recipient, utxos, feeRate, feeRates });

  // btcInsufficientBalanceValidator();
  if (!isBtcBalanceSufficient({ amount, spendableBtc })) {
    throw new BitcoinError('InsufficientFunds');
  }
}

interface isBtcBalanceSufficientArgs {
  amount: number;
  spendableBtc: BigNumber;
}
export function isBtcBalanceSufficient({ amount, spendableBtc }: isBtcBalanceSufficientArgs) {
  if (!spendableBtc) return false;
  const desiredSpend = new BigNumber(amount);
  if (desiredSpend.isGreaterThan(spendableBtc)) return false;
  return true;
}

export function btcMinimumSpendValidator() {
  return z
    .number({
      invalid_type_error: FormErrorMessages.MustBeNumber,
    })
    .refine(
      value => {
        if (!value) return false;
        const desiredSpend = btcToSat(value);
        if (desiredSpend.isLessThan(minSpendAmountInSats)) return false;
        return true;
      },
      {
        message: `Minimum is ${satToBtc(minSpendAmountInSats)}`,
      }
    );
}
