import { useMemo } from 'react';

import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import {
  type BondDescriptorMatch,
  compileWshDescriptor,
  getBondVaultKeys,
  getDescriptorInputsWithDisallowedSighash,
  getDescriptorMatchingInputIndexes,
  instantiateBondDescriptor,
  matchBondDescriptor,
} from '@leather.io/bitcoin';
import { RpcErrorCode } from '@leather.io/rpc';

import type { PolicyStore } from '@app/store/policy/policy-store.utils';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

type BitcoinPolicyStore = Extract<PolicyStore, { chain: 'bitcoin' }>;

interface BondProposalError {
  status: 'error';
  code: RpcErrorCode;
  message: string;
}

interface BondProposalMatch {
  status: 'matched';
  policy: BitcoinPolicyStore;
  bondDescriptor: string;
  unlockHeight: number;
  hash: string;
  counterpartyKey: string;
  vaultThreshold: number;
  vaultKeyCount: number;
}

type BondProposalRoute = BondProposalError | BondProposalMatch | null;

interface UseBondProposalRouteArgs {
  descriptor?: string;
  psbtHex: string;
}

function tryCompileScriptPubKey(descriptor: string): Uint8Array | null {
  try {
    return compileWshDescriptor(descriptor).scriptPubKey;
  } catch {
    return null;
  }
}

interface InstantiatedBondDescriptor {
  bondDescriptor: string;
  vaultThreshold: number;
  vaultKeyCount: number;
}

function tryInstantiateBondDescriptor(
  bondMatch: BondDescriptorMatch,
  policyDescriptor: string
): InstantiatedBondDescriptor | null {
  try {
    const { threshold, keyExpressions } = getBondVaultKeys(policyDescriptor);
    const bondDescriptor = instantiateBondDescriptor({
      unlockHeight: bondMatch.unlockHeight,
      hash: bondMatch.hash,
      counterpartyKey: bondMatch.counterpartyKey,
      threshold,
      keyExpressions,
    });
    return { bondDescriptor, vaultThreshold: threshold, vaultKeyCount: keyExpressions.length };
  } catch {
    return null;
  }
}

function tryParsePsbtTransaction(psbtHex: string): btc.Transaction | null {
  try {
    return btc.Transaction.fromPSBT(hexToBytes(psbtHex));
  } catch {
    return null;
  }
}

function makeBondProposalError(code: RpcErrorCode, message: string): BondProposalError {
  return { status: 'error', code, message };
}

function makeBondDescriptorMismatchError(): BondProposalError {
  return makeBondProposalError(
    RpcErrorCode.INVALID_REQUEST,
    'Connected multisig account does not match this bond descriptor'
  );
}

export function useBondProposalRoute({
  descriptor,
  psbtHex,
}: UseBondProposalRouteArgs): BondProposalRoute {
  const policy = useCurrentPolicy();

  return useMemo(() => {
    if (policy?.chain !== 'bitcoin') return null;

    if (!descriptor || !psbtHex)
      return makeBondProposalError(
        RpcErrorCode.INVALID_PARAMS,
        'Proposing a transaction requires a descriptor and PSBT'
      );

    const bondMatch = matchBondDescriptor(descriptor);
    if (!bondMatch)
      return makeBondProposalError(
        RpcErrorCode.INVALID_PARAMS,
        'Descriptor is not a supported bond template'
      );

    const requestScriptPubKey = tryCompileScriptPubKey(descriptor);
    if (!requestScriptPubKey)
      return makeBondProposalError(
        RpcErrorCode.INVALID_PARAMS,
        'Bond descriptor could not be compiled'
      );

    const tx = tryParsePsbtTransaction(psbtHex);
    if (!tx || tx.inputsLength === 0)
      return makeBondProposalError(RpcErrorCode.INVALID_PARAMS, 'Invalid PSBT hex');

    const instantiated = tryInstantiateBondDescriptor(bondMatch, policy.descriptor);
    if (!instantiated) return makeBondDescriptorMismatchError();

    const { bondDescriptor, vaultThreshold, vaultKeyCount } = instantiated;
    const bondScriptPubKey = tryCompileScriptPubKey(bondDescriptor);
    if (!bondScriptPubKey) return makeBondDescriptorMismatchError();
    if (bytesToHex(bondScriptPubKey) !== bytesToHex(requestScriptPubKey))
      return makeBondDescriptorMismatchError();

    const matchedInputIndexes = getDescriptorMatchingInputIndexes(tx, bondScriptPubKey);
    if (matchedInputIndexes.length !== tx.inputsLength)
      return makeBondProposalError(
        RpcErrorCode.INVALID_REQUEST,
        'All PSBT inputs must be locked by the bond descriptor'
      );

    if (getDescriptorInputsWithDisallowedSighash(tx, matchedInputIndexes).length > 0)
      return makeBondProposalError(
        RpcErrorCode.INVALID_REQUEST,
        'Bond proposals only support SIGHASH_DEFAULT or SIGHASH_ALL inputs'
      );

    return {
      status: 'matched',
      policy,
      bondDescriptor,
      unlockHeight: bondMatch.unlockHeight,
      hash: bondMatch.hash,
      counterpartyKey: bondMatch.counterpartyKey,
      vaultThreshold,
      vaultKeyCount,
    };
  }, [policy, descriptor, psbtHex]);
}
