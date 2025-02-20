import { type BtcFormSchema } from '@/features/send/forms/btc/btc-form-schema';
import { type StxFormSchema } from '@/features/send/forms/stx/stx-form-schema';
import { type Account } from '@/store/accounts/accounts';
import { bytesToHex } from '@noble/hashes/utils';
import { type PublicKey } from '@stacks/common';
import { ChainId, type StacksNetwork } from '@stacks/network';
import BigNumber from 'bignumber.js';
import memoize from 'p-memoize';

import {
  type BitcoinNativeSegwitPayer,
  type CoinSelectionUtxo,
  createBitcoinAddress,
  generateBitcoinUnsignedTransactionNativeSegwit,
  getBtcSignerLibNetworkConfigByMode,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
import { type BitcoinNetworkModes } from '@leather.io/models';
import { type Utxo, defaultStacksFees, isAddressCompliant } from '@leather.io/query';
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

export function createCoinSelectionUtxos(utxos: Utxo[]): CoinSelectionUtxo[] {
  return utxos.map(utxo => ({
    address: utxo.address,
    txid: utxo.txid,
    value: Number(utxo.value),
    vout: utxo.vout,
  }));
}

export function isUserInputEffectivelyZero(input: string) {
  return input === '0' || /^0\.0*$/.test(input);
}

export function getInitialRelevantAccounts(accounts: Account[]) {
  return accounts.filter(account => account.status !== 'hidden');
}

export function validateDecimalPlaces(value: string, maxDecimalPlaces: number) {
  return (value.split('.')[1] ?? '').length <= maxDecimalPlaces;
}

export function btcFormValuesToPsbtHex(
  values: BtcFormSchema,
  nativeSegwitPayer: BitcoinNativeSegwitPayer,
  utxos: Utxo[],
  networkMode: BitcoinNetworkModes
) {
  const { feeRate, amount: inputAmount, isSendingMax, recipient } = values;

  try {
    const tx = generateBitcoinUnsignedTransactionNativeSegwit({
      payerAddress: createBitcoinAddress(nativeSegwitPayer.address),
      payerPublicKey: bytesToHex(nativeSegwitPayer.publicKey),
      recipients: [
        {
          address: createBitcoinAddress(recipient),
          amount: createMoneyFromDecimal(new BigNumber(inputAmount), 'BTC'),
        },
      ],
      feeRate,
      isSendingMax,
      utxos: createCoinSelectionUtxos(utxos),
      bip32Derivation: [payerToBip32Derivation(nativeSegwitPayer)],
      network: getBtcSignerLibNetworkConfigByMode(networkMode),
    });
    return Promise.resolve(bytesToHex(tx.psbt));
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
    publicKey: publicKey,
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
  if (!shouldCheckCompliance) {
    return true;
  }

  return isAddressCompliant({ address, chain });
}

export const addressComplianceValidator = memoize(rawAddressComplianceValidator);
