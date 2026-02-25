import { TransactionInput, TransactionOutput } from '@scure/btc-signer/psbt';

import {
  extractRequiredKeyOrigins,
  getPsbtAsTransaction,
  getPsbtTxInputs,
} from '@leather.io/bitcoin';
import { decomposeDescriptor } from '@leather.io/crypto';
import {
  BitcoinNetworkModes,
  FeeTypes,
  Money,
  type TransactionFees,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

function getTxInputDerivationPath(input: TransactionInput | TransactionOutput) {
  const inputDescriptor = extractRequiredKeyOrigins(
    input.bip32Derivation ?? input.tapBip32Derivation ?? []
  )[0];
  if (inputDescriptor) return decomposeDescriptor(inputDescriptor);

  return undefined;
}

export function getPsbtInputDerivationPaths({ psbtHex }: { psbtHex: string }) {
  const tx = getPsbtAsTransaction(psbtHex);
  const inputs = getPsbtTxInputs(tx);

  return inputs.map(getTxInputDerivationPath).filter(isDefined);
}

type SignAtIndex = number | number[] | undefined;

export function normalizeSignAtIndex(signAtIndex: SignAtIndex) {
  if (Array.isArray(signAtIndex)) return signAtIndex;
  if (signAtIndex === undefined) return undefined;
  return [signAtIndex];
}

export function getPsbtNetwork(network: BitcoinNetworkModes) {
  if (network === 'testnet')
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.testnet4];
  if (network === 'mainnet')
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet];
  throw new Error('This network is currently not supported');
}

interface FeeTypeParams {
  psbtFee: Money;
  fees: TransactionFees;
}
export function getFeeType({ psbtFee, fees }: FeeTypeParams) {
  const { low, standard, high } = fees.options;
  if (psbtFee.amount.isEqualTo(standard.value.amount)) {
    return FeeTypes.Middle;
  }
  if (psbtFee.amount.isEqualTo(low.value.amount)) {
    return FeeTypes.Low;
  }
  if (psbtFee.amount.isEqualTo(high.value.amount)) {
    return FeeTypes.High;
  }
  return FeeTypes.Custom;
}
