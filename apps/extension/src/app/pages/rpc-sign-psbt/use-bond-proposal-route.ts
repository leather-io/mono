import { useMemo } from 'react';
import { useSelector } from 'react-redux';

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
import { makeAccountIdentifer } from '@leather.io/crypto';
import { RpcErrorCode } from '@leather.io/rpc';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import type { PolicyStore } from '@app/store/policy/policy-store.utils';
import {
  filterPoliciesByParentAndNetwork,
  selectAllPolicies,
} from '@app/store/policy/policy.selectors';

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
}

type BondProposalRoute = BondProposalError | BondProposalMatch | null;

interface UseBondProposalRouteArgs {
  propose: boolean;
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

function tryInstantiateBondDescriptor(
  bondMatch: BondDescriptorMatch,
  policyDescriptor: string
): string | null {
  try {
    const { threshold, keyExpressions } = getBondVaultKeys(policyDescriptor);
    return instantiateBondDescriptor({
      unlockHeight: bondMatch.unlockHeight,
      hash: bondMatch.hash,
      counterpartyKey: bondMatch.counterpartyKey,
      threshold,
      keyExpressions,
    });
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

export function useBondProposalRoute({
  propose,
  descriptor,
  psbtHex,
}: UseBondProposalRouteArgs): BondProposalRoute {
  const policies = useSelector(selectAllPolicies);
  const currentAccount = useCurrentAccountId();
  const currentNetwork = useCurrentNetwork();

  return useMemo(() => {
    if (!propose) return null;

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

    const candidatePolicies = filterPoliciesByParentAndNetwork(
      policies,
      makeAccountIdentifer(currentAccount.fingerprint, currentAccount.accountIndex),
      currentNetwork.id
    ).filter((policy): policy is BitcoinPolicyStore => policy.chain === 'bitcoin');

    for (const policy of candidatePolicies) {
      const bondDescriptor = tryInstantiateBondDescriptor(bondMatch, policy.descriptor);
      if (!bondDescriptor) continue;

      const bondScriptPubKey = tryCompileScriptPubKey(bondDescriptor);
      if (!bondScriptPubKey) continue;
      if (bytesToHex(bondScriptPubKey) !== bytesToHex(requestScriptPubKey)) continue;

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
      };
    }

    return makeBondProposalError(
      RpcErrorCode.INVALID_REQUEST,
      'No multisig account matches this bond descriptor'
    );
  }, [propose, descriptor, psbtHex, policies, currentAccount, currentNetwork.id]);
}
