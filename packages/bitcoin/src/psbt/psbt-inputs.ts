import { bytesToHex } from '@noble/hashes/utils';
import { SigHash } from '@scure/btc-signer';
import type { TransactionInput } from '@scure/btc-signer/psbt';

import type { BitcoinAddress, BitcoinNetworkModes } from '@leather.io/models';
import { isDefined, isUndefined } from '@leather.io/utils';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import { getBitcoinInputAddress, getBitcoinInputValue } from '../utils/bitcoin.utils';

export interface PsbtInput {
  address: BitcoinAddress;
  index?: number;
  isMutable: boolean;
  toSign: boolean;
  txid: string;
  value: number;
  bip32Derivation: TransactionInput['bip32Derivation'];
  tapBip32Derivation: TransactionInput['tapBip32Derivation'];
}

interface GetParsedInputsArgs {
  inputs: TransactionInput[];
  indexesToSign?: number[];
  networkMode: BitcoinNetworkModes;
  psbtAddresses: BitcoinAddress[];
}

interface GetParsedInputsResponse {
  isPsbtMutable: boolean;
  parsedInputs: PsbtInput[];
}
export function getParsedInputs({
  inputs,
  indexesToSign,
  networkMode,
  psbtAddresses,
}: GetParsedInputsArgs): GetParsedInputsResponse {
  const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode(networkMode);

  const signAll = isUndefined(indexesToSign);
  const psbtInputs = inputs.map((input, i) => {
    const bitcoinAddress = isDefined(input.index)
      ? getBitcoinInputAddress(input, bitcoinNetwork)
      : null;
    if (bitcoinAddress === null) {
      throw new Error('PSBT input has unsupported bitcoin address');
    }
    const isCurrentAddress = psbtAddresses.includes(bitcoinAddress);
    // Flags when not signing ALL inputs/outputs (NONE, SINGLE, and ANYONECANPAY)
    const canChange =
      isCurrentAddress &&
      !(!input.sighashType || input.sighashType === 0 || input.sighashType === 1);
    // Should we check the sighashType here before it gets to the signing lib?
    const toSignAll = isCurrentAddress && signAll;
    const toSignIndex = isCurrentAddress && !signAll && indexesToSign.includes(i);

    return {
      address: bitcoinAddress,
      index: input.index,
      bip32Derivation: input.bip32Derivation,
      tapBip32Derivation: input.tapBip32Derivation,
      isMutable: canChange,
      toSign: toSignAll || toSignIndex,
      txid: input.txid ? bytesToHex(input.txid) : '',
      value: isDefined(input.index) ? getBitcoinInputValue(input) : 0,
    };
  });

  const isPsbtMutable = psbtInputs.some(input => input.isMutable);

  return { isPsbtMutable, parsedInputs: psbtInputs };
}

export const defaultAllowedSighashTypes: number[] = [SigHash.DEFAULT, SigHash.ALL];

export function isDisallowedSighash(
  sighashType: number | undefined,
  allowedSighash: number[] = []
): boolean {
  if (isUndefined(sighashType)) return false;
  return !defaultAllowedSighashTypes.includes(sighashType) && !allowedSighash.includes(sighashType);
}

interface GetInputsToSignWithDisallowedSighashArgs {
  inputs: TransactionInput[];
  indexesToSign?: number[];
  networkMode: BitcoinNetworkModes;
  psbtAddresses: BitcoinAddress[];
  allowedSighash?: number[];
}

export function getInputsToSignWithDisallowedSighash({
  inputs,
  indexesToSign,
  networkMode,
  psbtAddresses,
  allowedSighash,
}: GetInputsToSignWithDisallowedSighashArgs): number[] {
  const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode(networkMode);
  const signAll = isUndefined(indexesToSign);

  return inputs.reduce<number[]>((disallowedIndexes, input, i) => {
    if (!signAll && !indexesToSign.includes(i)) return disallowedIndexes;
    if (!isDisallowedSighash(input.sighashType, allowedSighash)) return disallowedIndexes;
    const address = isDefined(input.index) ? getBitcoinInputAddress(input, bitcoinNetwork) : null;
    if (address === null || !psbtAddresses.includes(address)) return disallowedIndexes;
    return [...disallowedIndexes, i];
  }, []);
}
