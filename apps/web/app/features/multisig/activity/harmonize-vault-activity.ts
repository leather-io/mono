import type { BlockchainActivityView } from '@leather.io/features';
import type { MarketData, MultisigTransactionSummary } from '@leather.io/models';

import type { ProposalPayloadContext } from '../transactions/decode-proposal-summary';
import {
  type MultisigActivityClassification,
  type ProposalTokenInfo,
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
  vaultId?: string;
  vaultAccountId?: string;
}

export interface OnchainActivityItem {
  view: BlockchainActivityView;
  vaultId: string;
  vaultAccountId: string;
}

interface HarmonizeVaultActivityInput {
  onchain: OnchainActivityItem[];
  multisigTransactions: VaultMultisigTransaction[];
  payloadsById?: ReadonlyMap<string, string>;
  classifyContract?(
    contractId: string,
    functionName: string
  ): MultisigActivityClassification | undefined;
  getTokenInfo?(contractId: string): ProposalTokenInfo | undefined;
  marketData?: { btc?: MarketData; stx?: MarketData };
  frontier?: number;
}

interface ActivityRow {
  item: VaultActivityItem;
  inFlight: boolean;
  sortKey: number;
}

function normalizeTxid(txid: string) {
  return txid.toLowerCase().replace(/^0x/, '');
}

// Twins are matched per account, not per txid alone: an internal transfer between two vault
// accounts is one txid seen twice (a send and a receive), and each side belongs to its own account.
function twinKey(txid: string, vaultAccountId: string) {
  return `${normalizeTxid(txid)}::${vaultAccountId}`;
}

function compareActivityRows(a: ActivityRow, b: ActivityRow): number {
  return (
    Number(b.inFlight) - Number(a.inFlight) ||
    b.sortKey - a.sortKey ||
    a.item.view.txid.localeCompare(b.item.view.txid)
  );
}

function isActiveTransaction(transaction: MultisigTransactionSummary) {
  return mapMultisigTransactionStatus(transaction.status) === 'pending';
}

export function selectTransactionIdsNeedingPayload(
  onchain: OnchainActivityItem[],
  multisigTransactions: VaultMultisigTransaction[]
): string[] {
  const onchainKeys = new Set(onchain.map(item => twinKey(item.view.txid, item.vaultAccountId)));
  return multisigTransactions
    .filter(
      ({ transaction }) =>
        transaction.txId === null ||
        !onchainKeys.has(twinKey(transaction.txId, transaction.vaultAccountId))
    )
    .map(({ transaction }) => transaction.id);
}

export function harmonizeVaultActivity({
  onchain,
  multisigTransactions,
  payloadsById,
  classifyContract,
  getTokenInfo,
  marketData,
  frontier,
}: HarmonizeVaultActivityInput): VaultActivityItem[] {
  const onchainByKey = new Map(
    onchain.map(item => [twinKey(item.view.txid, item.vaultAccountId), item])
  );
  const matchedKeys = new Set<string>();
  const rows: ActivityRow[] = [];

  for (const item of multisigTransactions) {
    const { transaction, payloadContext } = item;
    const key =
      transaction.txId === null ? null : twinKey(transaction.txId, transaction.vaultAccountId);
    const twin = key === null ? undefined : onchainByKey.get(key);
    const isActive = isActiveTransaction(transaction);

    if (twin !== undefined && key !== null) {
      matchedKeys.add(key);
      const inFlight = isActive && twin.view.status === 'pending';
      rows.push({
        item: {
          view: twin.view,
          multisig: item,
          vaultId: item.vaultId,
          vaultAccountId: transaction.vaultAccountId,
        },
        inFlight,
        sortKey: inFlight ? transaction.proposalTimestamp : twin.view.timestamp,
      });
      continue;
    }

    const view = createMultisigTransactionActivityView(payloadContext, transaction, {
      rawPayload: payloadsById?.get(transaction.id),
      marketData: payloadContext.network.startsWith('btc') ? marketData?.btc : marketData?.stx,
      classifyContract,
      getTokenInfo,
    });
    if (!isActive && frontier !== undefined && view.timestamp < frontier) continue;
    rows.push({
      item: {
        view,
        multisig: item,
        vaultId: item.vaultId,
        vaultAccountId: transaction.vaultAccountId,
      },
      inFlight: isActive,
      sortKey: isActive ? transaction.proposalTimestamp : view.timestamp,
    });
  }

  for (const onchainItem of onchain) {
    if (matchedKeys.has(twinKey(onchainItem.view.txid, onchainItem.vaultAccountId))) continue;
    rows.push({
      item: {
        view: onchainItem.view,
        vaultId: onchainItem.vaultId,
        vaultAccountId: onchainItem.vaultAccountId,
      },
      inFlight: onchainItem.view.status === 'pending',
      sortKey: onchainItem.view.timestamp,
    });
  }

  rows.sort(compareActivityRows);
  return rows.map(row => row.item);
}
