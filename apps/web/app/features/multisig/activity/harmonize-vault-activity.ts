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

export interface HarmonizedVaultActivity {
  active: VaultActivityItem[];
  history: VaultActivityItem[];
}

export interface HarmonizeVaultActivityInput {
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

function byNewestProposal(a: VaultActivityItem, b: VaultActivityItem) {
  const aTimestamp = a.multisig?.transaction.proposalTimestamp ?? a.view.timestamp;
  const bTimestamp = b.multisig?.transaction.proposalTimestamp ?? b.view.timestamp;
  if (bTimestamp !== aTimestamp) return bTimestamp - aTimestamp;
  return a.view.txid.localeCompare(b.view.txid);
}

function byNewestView(a: VaultActivityItem, b: VaultActivityItem) {
  if (b.view.timestamp !== a.view.timestamp) return b.view.timestamp - a.view.timestamp;
  return a.view.txid.localeCompare(b.view.txid);
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

export function harmonizeVaultActivity(
  input: HarmonizeVaultActivityInput
): HarmonizedVaultActivity {
  const { onchain, multisigTransactions, payloadsById, classifyContract, marketData, frontier } =
    input;

  const onchainByTxid = new Map(onchain.map(view => [normalizeTxid(view.txid), view]));
  const matchedTxids = new Set<string>();
  const active: VaultActivityItem[] = [];
  const history: VaultActivityItem[] = [];

  for (const item of multisigTransactions) {
    const { transaction, payloadContext } = item;
    const twinKey = transaction.txId === null ? null : normalizeTxid(transaction.txId);
    const twin = twinKey === null ? undefined : onchainByTxid.get(twinKey);
    const isActive = isActiveTransaction(transaction);

    if (twin !== undefined && twinKey !== null) {
      matchedTxids.add(twinKey);
      const row = { view: twin, multisig: item };
      if (isActive) active.push(row);
      else history.push(row);
      continue;
    }

    const view = createMultisigTransactionActivityView(payloadContext, transaction, {
      rawPayload: payloadsById?.get(transaction.id),
      marketData: payloadContext.network.startsWith('btc') ? marketData?.btc : marketData?.stx,
      classifyContract,
    });
    if (isActive) {
      active.push({ view, multisig: item });
      continue;
    }
    if (frontier === undefined || view.timestamp >= frontier) {
      history.push({ view, multisig: item });
    }
  }

  for (const view of onchain) {
    if (matchedTxids.has(normalizeTxid(view.txid))) continue;
    history.push({ view });
  }

  active.sort(byNewestProposal);
  history.sort(byNewestView);
  return { active, history };
}
