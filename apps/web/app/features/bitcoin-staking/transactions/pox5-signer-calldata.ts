import { StacksNetworkName } from '@stacks/network';
import { poxAddressToBtcAddress, poxAddressToTuple } from '@stacks/stacking';
import {
  ClarityType,
  ClarityValue,
  bufferCV,
  deserializeCV,
  noneCV,
  serializeCVBytes,
  someCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

// The single churn point for the pox-5 payout-preference encoding. The
// signer-calldata is a serialized {pox-addr, max-fee} tuple inside an
// (optional (buff 500)); the max-fee unit (sats vs micro-sBTC) is not yet
// confirmed by the SIP draft, so it is only ever touched here.
export interface Pox5PayoutPreference {
  btcRewardAddress: string;
  maxFeeSats: bigint;
  minClaimSats?: bigint;
}

const maxSignerCalldataBytes = 500;

export function encodeSignerCalldata(preference: Pox5PayoutPreference | undefined): ClarityValue {
  if (!preference) return noneCV();
  const calldataTuple = tupleCV({
    'pox-addr': poxAddressToTuple(preference.btcRewardAddress),
    'max-fee': uintCV(preference.maxFeeSats),
    ...(preference.minClaimSats !== undefined
      ? { 'min-claim': uintCV(preference.minClaimSats) }
      : {}),
  });
  const bytes = serializeCVBytes(calldataTuple);
  if (bytes.byteLength > maxSignerCalldataBytes) {
    throw new Error(`Signer calldata exceeds the ${maxSignerCalldataBytes}-byte contract limit.`);
  }
  return someCV(bufferCV(bytes));
}

// Accepts both shapes the preference appears in on chain: the raw calldata
// (optional buff wrapping a serialized tuple, as found in pending stake
// transactions) and the already-deserialized (optional {pox-addr, max-fee})
// returned by the signer-manager's get-pox-addr read-only.
export function decodePayoutPreference(
  value: ClarityValue,
  network: StacksNetworkName
): Pox5PayoutPreference | null {
  if (value.type !== ClarityType.OptionalSome) return null;

  const inner = value.value;
  const calldata = inner.type === ClarityType.Buffer ? deserializeCV(inner.value) : inner;
  if (calldata.type !== ClarityType.Tuple) return null;

  const poxAddr = calldata.value['pox-addr'];
  const maxFee = calldata.value['max-fee'];
  const minClaim = calldata.value['min-claim'];
  if (!poxAddr || !maxFee || maxFee.type !== ClarityType.UInt) return null;

  return {
    btcRewardAddress: poxAddressToBtcAddress(poxAddr, network),
    maxFeeSats: BigInt(maxFee.value),
    ...(minClaim && minClaim.type === ClarityType.UInt
      ? { minClaimSats: BigInt(minClaim.value) }
      : {}),
  };
}
