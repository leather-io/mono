import type {
  MultisigTransactionSummary,
  StacksProtocol,
  StacksProtocolAction,
  VaultAccount,
  VaultAccountSummary,
} from '@leather.io/models';
import { isDefined } from '@leather.io/utils';

import {
  type DecodedProposalPayload,
  decodeProposalPayload,
} from '../transactions/decode-proposal-summary';
import type { VaultMultisigTransaction } from './harmonize-vault-activity';
import type { MultisigActivityClassification } from './multisig-transaction-activity-view';

export type ActivityAccount = VaultAccount | VaultAccountSummary;

type DecodedContractCall = Extract<DecodedProposalPayload, { type: 'contractCall' }>;

type DecodedSip10Transfer = Extract<DecodedProposalPayload, { type: 'sip10Transfer' }>;

export interface ContractActionTarget {
  key: string;
  protocol: StacksProtocol;
  contractName: string;
  functionName: string;
}

export function buildVaultMultisigTransactions(
  accounts: ActivityAccount[],
  summariesByAccount: MultisigTransactionSummary[][],
  vaultNamesById?: ReadonlyMap<string, string>
): VaultMultisigTransaction[] {
  return accounts.flatMap((account, index) =>
    (summariesByAccount[index] ?? []).map(transaction => ({
      transaction,
      payloadContext: { network: account.network, multisigAddress: account.multisigAddress },
      vaultId: account.vaultId,
      vaultName: vaultNamesById?.get(account.vaultId),
      threshold: account.threshold,
    }))
  );
}

export function decodeContractCallPayloads(
  multisigTransactions: VaultMultisigTransaction[],
  payloadsById: ReadonlyMap<string, string>
): DecodedContractCall[] {
  return multisigTransactions.flatMap(({ transaction, payloadContext }) => {
    if (payloadContext.network.startsWith('btc')) return [];
    const rawPayload = payloadsById.get(transaction.id);
    if (!rawPayload) return [];
    const payload = decodeProposalPayload(payloadContext, rawPayload);
    if (!payload || payload.type !== 'contractCall') return [];
    return [payload];
  });
}

export function collectTokenContractIds(
  multisigTransactions: VaultMultisigTransaction[],
  payloadsById: ReadonlyMap<string, string>
): string[] {
  const decoded = multisigTransactions.flatMap<DecodedSip10Transfer>(
    ({ transaction, payloadContext }) => {
      if (payloadContext.network.startsWith('btc')) return [];
      const rawPayload = payloadsById.get(transaction.id);
      if (!rawPayload) return [];
      const payload = decodeProposalPayload(payloadContext, rawPayload);
      if (!payload || payload.type !== 'sip10Transfer') return [];
      return [payload];
    }
  );
  return [...new Set(decoded.map(payload => payload.token.contractId))];
}

export function collectContractAddresses(decodedContractCalls: DecodedContractCall[]): string[] {
  return [...new Set(decodedContractCalls.map(payload => payload.contractId.split('.')[0]))].filter(
    isDefined
  );
}

export function buildContractActionTargets(
  decodedContractCalls: DecodedContractCall[],
  protocolByAddress: ReadonlyMap<string, StacksProtocol | null>
): ContractActionTarget[] {
  const targetsByKey = new Map<string, ContractActionTarget>();
  for (const payload of decodedContractCalls) {
    const [address, contractName] = payload.contractId.split('.');
    const protocol = address === undefined ? null : protocolByAddress.get(address);
    if (!protocol || contractName === undefined) continue;
    const key = `${payload.contractId}|${payload.functionName}`;
    targetsByKey.set(key, { key, protocol, contractName, functionName: payload.functionName });
  }
  return [...targetsByKey.values()];
}

// Last-resort verb inference for registry-known protocols whose function
// mapping is missing from the protocol registry. Clarity function names
// follow strong conventions, so a conservative keyword match still beats
// rendering a verb-less "via {protocol}" row. Ordered most-specific first;
// explicit registry data always wins.
const inferredActionRules: readonly (readonly [string, StacksProtocolAction])[] = [
  ['add-liquidity', 'add-liquidity'],
  ['provide-liquidity', 'add-liquidity'],
  ['remove-liquidity', 'remove-liquidity'],
  ['withdraw-liquidity', 'remove-liquidity'],
  ['unstake-lp', 'unstake-lp'],
  ['stake-lp', 'stake-lp'],
  ['claim', 'claim-rewards'],
  ['swap', 'swap'],
  ['bridge', 'bridge'],
  ['borrow', 'borrow'],
  ['repay', 'repay'],
  ['supply', 'deposit'],
  ['deposit', 'deposit'],
  ['withdraw', 'withdraw'],
  ['stack-stx', 'stack'],
];

function inferActionFromFunctionName(functionName: string): StacksProtocolAction | undefined {
  const name = functionName.toLowerCase();
  return inferredActionRules.find(([keyword]) => name.includes(keyword))?.[1];
}

export function buildClassifications(
  actionTargets: ContractActionTarget[],
  actionsByTarget: (StacksProtocolAction | null | undefined)[]
): Map<string, MultisigActivityClassification> {
  return new Map<string, MultisigActivityClassification>(
    actionTargets.map((target, index) => [
      target.key,
      {
        action:
          actionsByTarget[index] ??
          inferActionFromFunctionName(target.functionName) ??
          'contract-execution',
        protocol: target.protocol.id,
        protocolName: target.protocol.name,
      },
    ])
  );
}
