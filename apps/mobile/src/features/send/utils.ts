import { type BtcFormSchema } from '@/features/send/forms/btc/btc-form-schema';
import { type StxFormSchema } from '@/features/send/forms/stx/stx-form-schema';
import { PayerLookupFn } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { bytesToHex } from '@noble/hashes/utils';
import { type PublicKey } from '@stacks/common';
import { ChainId, StacksNetwork } from '@stacks/network';
import BigNumber from 'bignumber.js';
import memoize from 'p-memoize';

import {
  createBitcoinAddress,
  generateBitcoinUnsignedTransaction,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import { type BitcoinNetworkModes, OwnedUtxo } from '@leather.io/models';
import { defaultStacksFees, isAddressCompliant } from '@leather.io/query';
import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import {
  convertAmountToBaseUnit,
  createMoney,
  createMoneyFromDecimal,
  isError,
} from '@leather.io/utils';

export function calculateDefaultStacksFee() {
  const defaultFeeFallback = 2500;
  const defaultFeeFallbackAsMoney = createMoney(defaultFeeFallback, 'STX');
  return convertAmountToBaseUnit(defaultStacksFees.estimates[1]?.fee ?? defaultFeeFallbackAsMoney);
}

export function isUserInputEffectivelyZero(input: string) {
  return input === '0' || /^0\.0*$/.test(input);
}

export function validateDecimalPlaces(value: string, maxDecimalPlaces: number) {
  return (value.split('.')[1] ?? '').length <= maxDecimalPlaces;
}

export interface BtcFormValuesToPsbtHexParams {
  values: BtcFormSchema;
  utxos: OwnedUtxo[];
  networkMode: BitcoinNetworkModes;
  changeAddress: string;
  payerLookup: PayerLookupFn;
}
export async function btcFormValuesToPsbtHex({
  values,
  utxos,
  networkMode,
  changeAddress,
  payerLookup,
}: BtcFormValuesToPsbtHexParams) {
  const { feeRate, amount: inputAmount, isSendingMax, recipient } = values;

  try {
    const tx = generateBitcoinUnsignedTransaction({
      recipients: [
        {
          address: createBitcoinAddress(recipient),
          amount: createMoneyFromDecimal(new BigNumber(inputAmount), 'BTC'),
        },
      ],
      feeRate,
      isSendingMax,
      utxos,
      network: getBtcSignerLibNetworkConfigByMode(networkMode),
      payerLookup,
      changeAddress,
    });
    return bytesToHex(tx.psbt);
  } catch (error) {
    return Promise.reject(isError(error) ? error : new Error(String(error)));
  }
}

export async function stxFormValuesToSerializedTransaction(
  values: StxFormSchema,
  publicKey: PublicKey,
  stacksNetwork: StacksNetwork
) {
  const { amount, fee, memo, nonce, recipient } = values;

  const tx = await generateStacksUnsignedTransaction({
    amount: createMoneyFromDecimal(new BigNumber(amount), 'STX'),
    fee: createMoneyFromDecimal(new BigNumber(fee), 'STX'),
    memo,
    nonce,
    recipient,
    txType: TransactionTypes.StxTokenTransfer,
    network: stacksNetwork,
    publicKey,
  });

  return tx.serialize();
}

interface addressComplianceValidatorParams {
  address: string;
  chain: ChainId | BitcoinNetworkModes;
  shouldCheckCompliance: boolean;
}

async function rawAddressComplianceValidator({
  address,
  chain,
  shouldCheckCompliance,
}: addressComplianceValidatorParams) {
  if (!shouldCheckCompliance) return true;

  return isAddressCompliant({ address, chain });
}

export const addressComplianceValidator = memoize(rawAddressComplianceValidator, {
  cacheKey: ([argument]) => argument.address,
});
