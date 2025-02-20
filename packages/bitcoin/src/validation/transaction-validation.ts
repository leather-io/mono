import { BitcoinAddress, type BitcoinNetworkModes, Money } from '@leather.io/models';

import { calculateMaxSpend } from '../coin-selection/calculate-max-spend';
import { GetBitcoinFeesArgs } from '../fees/bitcoin-fees';
import { BitcoinError } from '../validation/bitcoin-error';
import { isValidBitcoinAddress, isValidBitcoinNetworkAddress } from './address-validation';
import { isBtcBalanceSufficient, isBtcMinimumSpend } from './amount-validation';

interface BitcoinTransaction extends Omit<GetBitcoinFeesArgs, 'recipients'> {
  amount: Money;
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

  if (!isBtcMinimumSpend(amount)) {
    throw new BitcoinError('InsufficientAmount');
  }

  const maxSpend = calculateMaxSpend({ recipient, utxos, feeRate, feeRates });
  if (!isBtcBalanceSufficient({ desiredSpend: amount, maxSpend: maxSpend.amount })) {
    throw new BitcoinError('InsufficientFunds');
  }
}
