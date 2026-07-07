import type { BlockchainActivityView } from '@leather.io/features';
import type { MarketData, MultisigTransactionSummary } from '@leather.io/models';

import type { ProposalPayloadContext } from '../transactions/decode-proposal-summary';
import {
  type MultisigActivityClassification,
  createMultisigTransactionActivityView,
  mapMultisigTransactionStatus,
} from './multisig-transaction-activity-view';

export interface VaultMultisigTransaction {
  transaction: MultisigTransactionSummary;
  payloadContext: ProposalPayloadContext;
  vaultId: string;
  vaultName?: string;
  threshold?: number;
}

export interface VaultActivityItem {
  view: BlockchainActivityView;
  multisig?: VaultMultisigTransaction;
}

interface HarmonizeVaultActivityInput {
  onchain: BlockchainActivityView[];
  multisigTransactions: VaultMultisigTransaction[];
  payloadsById?: ReadonlyMap<string, string>;
  classifyContract?(contractId: string): MultisigActivityClassification | undefined;
  marketData?: { btc?: MarketData; stx?: MarketData };
  frontier?: number;
}

function normalizeTxid(txid: string) {
  return txid.toLowerCase().replace(/^0x/, '');
}

function isActiveTransaction(transaction: MultisigTransactionSummary) {
  return mapMultisigTransactionStatus(transaction.status) === 'pending';
}

export function selectTransactionIdsNeedingPayload(
  onchain: BlockchainActivityView[],
  multisigTransactions: VaultMultisigTransaction[]
): string[] {
  const onchainTxids = new Set(onchain.map(view => normalizeTxid(view.txid)));
  return multisigTransactions
    .filter(
      ({ transaction }) =>
        transaction.txId === null || !onchainTxids.has(normalizeTxid(transaction.txId))
    )
    .map(({ transaction }) => transaction.id);
}

export function harmonizeVaultActivity(input: HarmonizeVaultActivityInput): VaultActivityItem[] {
  const { onchain, multisigTransactions, payloadsById, classifyContract, marketData, frontier } =
    input;

  const onchainByTxid = new Map(onchain.map(view => [normalizeTxid(view.txid), view]));
  const matchedTxids = new Set<string>();
  const rows: { item: VaultActivityItem; sortKey: number }[] = [];

  for (const item of multisigTransactions) {
    const { transaction, payloadContext } = item;
    const twinKey = transaction.txId === null ? null : normalizeTxid(transaction.txId);
    const twin = twinKey === null ? undefined : onchainByTxid.get(twinKey);
    const isActive = isActiveTransaction(transaction);

    if (twin !== undefined && twinKey !== null) {
      matchedTxids.add(twinKey);
      rows.push({
        item: { view: twin, multisig: item },
        sortKey: isActive ? transaction.proposalTimestamp : twin.timestamp,
      });
      continue;
    }

    const view = createMultisigTransactionActivityView(payloadContext, transaction, {
      rawPayload: payloadsById?.get(transaction.id),
      marketData: payloadContext.network.startsWith('btc') ? marketData?.btc : marketData?.stx,
      classifyContract,
    });
    if (!isActive && frontier !== undefined && view.timestamp < frontier) continue;
    rows.push({
      item: { view, multisig: item },
      sortKey: isActive ? transaction.proposalTimestamp : view.timestamp,
    });
  }

  for (const view of onchain) {
    if (matchedTxids.has(normalizeTxid(view.txid))) continue;
    rows.push({ item: { view }, sortKey: view.timestamp });
  }

  rows.sort((a, b) => b.sortKey - a.sortKey || a.item.view.txid.localeCompare(b.item.view.txid));
  return rows.map(row => row.item);
}
