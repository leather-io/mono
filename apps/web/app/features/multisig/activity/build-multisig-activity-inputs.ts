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

export function buildClassifications(
  actionTargets: ContractActionTarget[],
  actionsByTarget: (StacksProtocolAction | null | undefined)[]
): Map<string, MultisigActivityClassification> {
  return new Map<string, MultisigActivityClassification>(
    actionTargets.map((target, index) => [
      target.key,
      {
        action: actionsByTarget[index] ?? 'contract-execution',
        protocol: target.protocol.id,
        protocolName: target.protocol.name,
      },
    ])
  );
}
