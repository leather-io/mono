import { injectable } from 'inversify';
import { chunk } from 'remeda';

import {
  type AccountAddresses,
  type BitcoinTransaction,
  type BlockchainActivity,
  type BlockchainActivityBalanceChange,
  type CryptoAssetId,
  type FungibleCryptoAsset,
  type MarketData,
  type StacksTx,
} from '@leather.io/models';
import { assertUnreachable, createMoney, hasStacksAddress, initBigNumber } from '@leather.io/utils';

import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type {
  HiroBalanceChangeResultItem,
  HiroPrincipalTransactionsResultItem,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { MarketDataService } from '../market/market-data.service';
import { StacksProtocolService } from '../protocols/stacks-protocol.service';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import {
  type ActivitySourceCursor,
  type ActivitySourceItem,
  type ActivitySources,
  getActivitySourcePage,
} from './activity-paginator';
import {
  activityTouchesAsset,
  applyMarketData,
  assetQuoteKey,
  sortActivityByTimestampDesc,
} from './activity.utils';
import { mapBitcoinActivity } from './bitcoin-activity.utils';
import {
  type ClassifiedContractCall,
  type FtBalanceChangeRow,
  buildConfirmedStacksActivity,
  buildOnchainStacksActivity,
  buildPendingStacksActivity,
  groupFtChangesByTxId,
  isFtBalanceChangeRow,
  isStacksActivityResultItem,
  mayTouchStacksAsset,
  toStacksSourceItem,
} from './stacks-activity.utils';

export type { ActivitySourceCursor } from './activity-paginator';

export interface ActivityRequest {
  account: AccountAddresses;
  cursor?: ActivitySourceCursor;
  limit?: number;
}

export interface ActivityResponse {
  items: BlockchainActivity[];
  nextCursor: ActivitySourceCursor | null;
  hasMore: boolean;
}

// Hiro v3 caps /principals/{p}/transactions at 50 results per page.
const stacksTxPageSize = 50;
const defaultActivityPageSize = 50;
// Hiro v3 caps /balance-changes at 20 tx_ids per call, so ft lookups are chunked.
const balanceChangesBatchSize = 20;
const activityByAssetScanPages = 10;
// BTC is fetched wholesale in a single request; this depth IS the BTC visibility horizon —
// older BTC activity is silently absent (the server imposes no page-size maximum).
const btcTxHorizonPageRequest = { page: 1, pageSize: 1000 };

@injectable()
export class BlockchainActivityService {
  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly stacksTransactionsService: StacksTransactionsService,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService,
    private readonly marketDataService: MarketDataService,
    private readonly sip10AssetService: Sip10AssetService,
    private readonly stacksProtocolService: StacksProtocolService
  ) {}

  public async getActivity(
    request: ActivityRequest,
    signal?: AbortSignal
  ): Promise<ActivityResponse> {
    const btcTxs = this.bitcoinTransactionsService.getAccountTransactions(
      request.account,
      btcTxHorizonPageRequest,
      signal
    );
    const page = await getActivitySourcePage(this.createSources(request.account, btcTxs, signal), {
      limit: request.limit ?? defaultActivityPageSize,
      cursor: request.cursor,
    });
    // Pending is stitched onto the first page only and sits above the cursor keyspace, so
    // pages 2+ never re-emit it. Dedup by txid, confirmed wins: a tx that confirms between
    // refetches transitions atomically (leaves pending, appears confirmed, exactly once).
    const [confirmed, allPending] = await Promise.all([
      this.mapSourceItems(request.account, page.items, signal),
      request.cursor === undefined
        ? this.getPendingActivity(request.account, btcTxs, signal)
        : Promise.resolve([]),
    ]);
    const confirmedTxids = new Set(confirmed.map(activity => activity.txid));
    const pending = allPending.filter(activity => !confirmedTxids.has(activity.txid));
    const items = await this.enrichWithMarketData([...pending, ...confirmed], signal);
    return {
      items,
      nextCursor: page.nextCursor,
      hasMore: page.nextCursor !== null,
    };
  }

  public async getActivityByAssetId(
    account: AccountAddresses,
    assetId: CryptoAssetId,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    switch (assetId.protocol) {
      case 'nativeBtc':
        return this.getBitcoinActivity(account, signal);
      case 'nativeStx':
      case 'sip10':
        return this.getStacksActivityByAssetId(account, assetId, signal);
      case 'sip9':
        // NFT balance changes aren't modeled yet (deferred), so there is nothing to filter on.
        return [];
      default:
        return assertUnreachable(assetId.protocol);
    }
  }

  // Reconstructs one activity from a txid alone, for the read-only detail of proposal-less activity.
  public async getActivityByTxId(
    account: AccountAddresses,
    txid: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    const activity = hasStacksAddress(account)
      ? await this.getStacksActivityByTxId(account.stacks.stxAddress, txid, signal)
      : await this.getBitcoinActivityByTxId(account, txid, signal);
    if (activity === null) return null;
    const [enriched] = await this.enrichWithMarketData([activity], signal);
    return enriched ?? null;
  }

  private async getBitcoinActivityByTxId(
    account: AccountAddresses,
    txid: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    if (account.bitcoin?.type !== 'fixedAddress') return null;
    const tx = await this.bitcoinTransactionsService.getTransactionByTxId(txid, signal);
    if (tx === null) return null;
    const { address } = account.bitcoin;
    return mapBitcoinActivity({
      ...tx,
      vin: tx.vin.map(input => ({ ...input, owned: input.address === address })),
      vout: tx.vout.map(output => ({ ...output, owned: output.address === address })),
    });
  }

  private async getStacksActivityByTxId(
    stxAddress: string,
    txid: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    const tx = await this.stacksTransactionsService.getTransactionById(txid, signal);
    if (tx === null) return null;
    const balanceChanges = await this.fetchTxStacksBalanceChanges(stxAddress, tx, signal);
    const classified =
      tx.tx_type === 'contract_call'
        ? await this.classifyContractCall(
            tx.contract_call.contract_id,
            tx.contract_call.function_name,
            signal
          )
        : undefined;
    return buildOnchainStacksActivity(tx, stxAddress, balanceChanges, classified);
  }

  // Only contract calls / deploys need this lookup; token transfers carry their stx amount inline.
  private async fetchTxStacksBalanceChanges(
    principal: string,
    tx: StacksTx,
    signal?: AbortSignal
  ): Promise<{ stxNet: string; ftChanges: BlockchainActivityBalanceChange[] }> {
    if (tx.tx_type !== 'contract_call' && tx.tx_type !== 'smart_contract') {
      return { stxNet: '0', ftChanges: [] };
    }
    const rows = await this.fetchBalanceChangesBatch(principal, [tx.tx_id], signal);
    const stxNet = rows.find(row => row.asset.type === 'stx')?.balance_change.net ?? '0';
    const ftChanges = (
      await Promise.all(
        rows.filter(isFtBalanceChangeRow).map(row => this.mapBalanceChange(row, signal))
      )
    ).filter((change): change is BlockchainActivityBalanceChange => change !== null);
    return { stxNet, ftChanges };
  }

  private async getBitcoinActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const btcTxs = this.bitcoinTransactionsService.getAccountTransactions(
      account,
      btcTxHorizonPageRequest,
      signal
    );
    const [txs, pending] = await Promise.all([btcTxs, this.getPendingBitcoinActivity(btcTxs)]);
    const confirmed = txs
      .filter(tx => tx.height !== undefined)
      .map(mapBitcoinActivity)
      .filter((activity): activity is BlockchainActivity => activity !== null)
      .sort(sortActivityByTimestampDesc);
    return this.enrichWithMarketData([...pending, ...confirmed], signal);
  }

  private async getStacksActivityByAssetId(
    account: AccountAddresses,
    assetId: CryptoAssetId,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const sourceItems = await this.getRecentStacksSourceItems(account, signal);
    const candidates = sourceItems.filter(item => mayTouchStacksAsset(item, assetId));
    const [confirmedAll, pendingAll] = await Promise.all([
      this.mapSourceItems(account, candidates, signal),
      this.getPendingStacksActivity(account, signal),
    ]);
    const scannedTxids = new Set(sourceItems.map(item => item.txid));
    const pending = pendingAll.filter(
      activity => !scannedTxids.has(activity.txid) && activityTouchesAsset(activity, assetId)
    );
    const confirmed = confirmedAll.filter(activity => activityTouchesAsset(activity, assetId));
    return this.enrichWithMarketData([...pending, ...confirmed], signal);
  }

  private async getRecentStacksSourceItems(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<ActivitySourceItem[]> {
    if (!hasStacksAddress(account)) return [];
    const items: ActivitySourceItem[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < activityByAssetScanPages; page++) {
      const res = await this.hiroStacksApiClient.getPrincipalTransactions(
        account.stacks.stxAddress,
        { cursor, limit: stacksTxPageSize },
        { signal }
      );
      items.push(...res.results.filter(isStacksActivityResultItem).map(toStacksSourceItem));
      if (res.cursor.next === null) break;
      cursor = res.cursor.next;
    }
    return items;
  }

  private async mapSourceItems(
    account: AccountAddresses,
    sourceItems: ActivitySourceItem[],
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const ftChangesByTxId = await this.fetchFtBalanceChanges(account, sourceItems, signal);
    const mapped = await Promise.all(
      sourceItems.map(item =>
        this.mapSourceItem(item, ftChangesByTxId.get(item.txid) ?? [], signal)
      )
    );
    return mapped.filter((activity): activity is BlockchainActivity => activity !== null);
  }

  // BTC pending carry no timestamp, so they sit above the receipt_time-sorted STX pending.
  private async getPendingActivity(
    account: AccountAddresses,
    btcTxs: Promise<BitcoinTransaction[]>,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const [stxPending, btcPending] = await Promise.all([
      this.getPendingStacksActivity(account, signal),
      this.getPendingBitcoinActivity(btcTxs),
    ]);
    return [...btcPending, ...stxPending];
  }

  private async getPendingStacksActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    if (!hasStacksAddress(account)) return [];
    const txs = await this.stacksTransactionsService.getPendingTransactions(
      account.stacks.stxAddress,
      signal
    );
    const mapped = await Promise.all(
      txs.map(tx => this.mapPendingStacksTx(tx, account.stacks.stxAddress, signal))
    );
    return mapped
      .filter((activity): activity is BlockchainActivity => activity !== null)
      .sort(sortActivityByTimestampDesc);
  }

  private async getPendingBitcoinActivity(
    btcTxs: Promise<BitcoinTransaction[]>
  ): Promise<BlockchainActivity[]> {
    const txs = await btcTxs;
    return txs
      .filter(tx => tx.height === undefined)
      .map(mapBitcoinActivity)
      .filter((activity): activity is BlockchainActivity => activity !== null);
  }

  // Classification is the only async dependency in mapping; the pure builders do the rest.
  private async mapPendingStacksTx(
    tx: StacksTx,
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    const classified =
      tx.tx_type === 'contract_call'
        ? await this.classifyContractCall(
            tx.contract_call.contract_id,
            tx.contract_call.function_name,
            signal
          )
        : undefined;
    return buildPendingStacksActivity(tx, stxAddress, classified);
  }

  private async mapSourceItem(
    item: ActivitySourceItem,
    ftChanges: BlockchainActivityBalanceChange[],
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    if (item.chain === 'bitcoin') return mapBitcoinActivity(item.raw);
    return this.mapStacksSourceItem(item.raw, ftChanges, signal);
  }

  private async mapStacksSourceItem(
    result: HiroPrincipalTransactionsResultItem,
    ftChanges: BlockchainActivityBalanceChange[],
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    const tx = result.transaction;
    const classified =
      tx.type === 'contract_call'
        ? await this.classifyContractCall(
            tx.contract_call.contract_id,
            tx.contract_call.function_name,
            signal
          )
        : undefined;
    return buildConfirmedStacksActivity(result, ftChanges, classified);
  }

  private async classifyContractCall(
    contractId: string,
    functionName: string,
    signal?: AbortSignal
  ): Promise<ClassifiedContractCall> {
    const [address, contractName] = contractId.split('.');
    if (address === undefined || contractName === undefined) {
      return { action: 'contract-execution' };
    }
    const protocol = await this.stacksProtocolService.getProtocolByAddress(address, signal);
    if (protocol === null) return { action: 'contract-execution' };
    const action = await this.stacksProtocolService.getContractActionType(
      protocol.id,
      contractName,
      functionName,
      signal
    );
    return {
      action: action ?? 'contract-execution',
      protocol: protocol.id,
      protocolName: protocol.name,
    };
  }

  private async fetchFtBalanceChanges(
    account: AccountAddresses,
    sourceItems: ActivitySourceItem[],
    signal?: AbortSignal
  ): Promise<Map<string, BlockchainActivityBalanceChange[]>> {
    const txIds = sourceItems
      .filter(item => item.chain === 'stacks' && item.raw.affected_balances.ft)
      .map(item => item.txid);
    if (txIds.length === 0) return new Map();

    const principal = account.stacks?.stxAddress;
    if (principal === undefined) return new Map();
    const batches = chunk(txIds, balanceChangesBatchSize);
    const rawBalanceChanges = (
      await Promise.all(
        batches.map(batch => this.fetchBalanceChangesBatch(principal, batch, signal))
      )
    ).flat();

    const balanceChanges = await Promise.all(
      rawBalanceChanges.filter(isFtBalanceChangeRow).map(async c => {
        const mapped = await this.mapBalanceChange(c, signal);
        return mapped === null ? null : { txId: c.tx_id, change: mapped };
      })
    );

    return groupFtChangesByTxId(balanceChanges);
  }

  // One batch can still span multiple response pages (≤ 50 rows per call), so drain the cursor.
  private async fetchBalanceChangesBatch(
    principal: string,
    txIds: string[],
    signal?: AbortSignal
  ): Promise<HiroBalanceChangeResultItem[]> {
    const rows: HiroBalanceChangeResultItem[] = [];
    let cursor: string | null = null;
    do {
      const res = await this.hiroStacksApiClient.getPrincipalBalanceChanges(
        principal,
        { txIds, cursor },
        { signal }
      );
      rows.push(...res.results);
      cursor = res.cursor.next;
    } while (cursor !== null);
    return rows;
  }

  private async mapBalanceChange(
    raw: FtBalanceChangeRow,
    signal?: AbortSignal
  ): Promise<BlockchainActivityBalanceChange | null> {
    const amount = initBigNumber(raw.balance_change.net);
    if (amount.isZero()) return null;
    try {
      const asset = await this.sip10AssetService.getAsset(raw.asset.identifier, signal);
      return {
        direction: amount.isNegative() ? 'sent' : 'received',
        asset,
        amount: {
          crypto: createMoney(amount.abs(), asset.symbol, asset.decimals),
          quote: createMoney(0, 'USD'),
        },
      };
    } catch (error) {
      // Cancellation must propagate — only genuine lookup failures degrade to null.
      if (signal?.aborted) throw error;
      return null;
    }
  }

  private async enrichWithMarketData(
    activities: BlockchainActivity[],
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const marketDataByKey = await this.fetchMarketData(activities, signal);
    return applyMarketData(activities, marketDataByKey);
  }

  private async fetchMarketData(
    activities: BlockchainActivity[],
    signal?: AbortSignal
  ): Promise<Map<string, MarketData>> {
    const assetsByKey = new Map<string, FungibleCryptoAsset>();
    for (const activity of activities) {
      for (const change of activity.balanceChanges) {
        if (change.asset.category === 'fungible') {
          assetsByKey.set(assetQuoteKey(change.asset), change.asset);
        }
      }
    }
    const entries = await Promise.all(
      [...assetsByKey].map(async ([key, asset]) => {
        try {
          return [key, await this.marketDataService.getMarketData(asset, signal)] as const;
        } catch (error) {
          // Cancellation must propagate — only genuine quote failures degrade to null.
          if (signal?.aborted) throw error;
          return null;
        }
      })
    );
    return new Map(
      entries.filter((entry): entry is readonly [string, MarketData] => entry !== null)
    );
  }

  private createSources(
    account: AccountAddresses,
    btcTxs: Promise<BitcoinTransaction[]>,
    signal?: AbortSignal
  ): ActivitySources {
    return {
      fetchAllBtcTx: async () => {
        const txs = await btcTxs;
        const items: ActivitySourceItem[] = [];
        for (const tx of txs) {
          // The merge keyspace is confirmed-only: unconfirmed txs belong to the pending
          // stitch, and an unconfirmed timestamp would be an unstable cursor anchor.
          if (tx.height === undefined || tx.time === undefined) continue;
          items.push({ txid: tx.txid, chain: 'bitcoin', timestamp: tx.time, raw: tx });
        }
        return items;
      },
      fetchStacksTxPage: async (cursor: string | null) => {
        if (!hasStacksAddress(account)) {
          return { items: [], currentCursor: cursor, nextCursor: null };
        }
        const res = await this.hiroStacksApiClient.getPrincipalTransactions(
          account.stacks.stxAddress,
          { cursor, limit: stacksTxPageSize },
          { signal }
        );
        return {
          items: res.results.filter(isStacksActivityResultItem).map(toStacksSourceItem),
          currentCursor: res.cursor.current,
          nextCursor: res.cursor.next,
        };
      },
    };
  }
}
