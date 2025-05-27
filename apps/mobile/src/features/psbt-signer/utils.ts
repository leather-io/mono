import { TransactionInput, TransactionOutput } from '@scure/btc-signer/psbt';

import {
  extractRequiredKeyOrigins,
  getBitcoinFees,
  getPsbtAsTransaction,
  getPsbtTxInputs,
} from '@leather.io/bitcoin';
import { decomposeDescriptor } from '@leather.io/crypto';
import {
  BitcoinNetworkModes,
  FeeTypes,
  Money,
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
  fees: ReturnType<typeof getBitcoinFees>;
}
export function getFeeType({ psbtFee, fees }: FeeTypeParams) {
  if (fees.standard.fee?.amount && psbtFee.amount.isEqualTo(fees.standard.fee.amount)) {
    return FeeTypes.Middle;
  }
  if (fees.low.fee?.amount && psbtFee.amount.isEqualTo(fees.low.fee.amount)) {
    return FeeTypes.Low;
  }
  if (fees.high.fee?.amount && psbtFee.amount.isEqualTo(fees.high.fee.amount)) {
    return FeeTypes.High;
  }
  return FeeTypes.Custom;
}
