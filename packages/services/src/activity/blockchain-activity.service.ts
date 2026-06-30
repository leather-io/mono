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
  type StacksProtocolAction,
  type StacksProtocolId,
  type StacksTx,
} from '@leather.io/models';
import {
  assertUnreachable,
  baseCurrencyAmountInQuoteWithFallback,
  createMoney,
  hasStacksAddress,
  initBigNumber,
  matchesAssetId,
} from '@leather.io/utils';

import { Sip9AssetService } from '../assets/sip9-asset.service';
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
  type ActivitySourceItem,
  type ActivitySources,
  getActivitySourcePage,
} from './activity-paginator';
import { sortActivityByTimestampDesc } from './activity.utils';
import { mapBitcoinActivity } from './bitcoin-activity.utils';
import type { ActivityRequest, ActivityResponse } from './blockchain-activity.types';
import {
  buildStacksActivity,
  buildStxBalanceChange,
  isStacksActivityResultItem,
  mapStacksActivityStatus,
  reclassifySip10Transfer,
} from './stacks-activity.utils';

const stxPageLimit = 50;
const defaultActivityPageSize = 50;
const balanceChangesBatchSize = 20;
const activityByAssetScanPages = 10;

type FtBalanceChangeRow = HiroBalanceChangeResultItem & {
  readonly asset: { readonly type: 'ft'; readonly identifier: string };
};

function isFtBalanceChangeRow(row: HiroBalanceChangeResultItem): row is FtBalanceChangeRow {
  return row.asset.type === 'ft';
}

function assetQuoteKey(asset: FungibleCryptoAsset): string {
  return 'assetId' in asset ? asset.assetId : asset.symbol;
}

@injectable()
export class BlockchainActivityService {
  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly stacksTransactionsService: StacksTransactionsService,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService,
    private readonly marketDataService: MarketDataService,
    private readonly sip10AssetService: Sip10AssetService,
    private readonly sip9AssetService: Sip9AssetService,
    private readonly stacksProtocolService: StacksProtocolService
  ) {}

  public async getActivity(
    request: ActivityRequest,
    signal?: AbortSignal
  ): Promise<ActivityResponse> {
    const btcTxs = this.bitcoinTransactionsService.getAccountTransactions(request.account, signal);
    const page = await getActivitySourcePage(this.createSources(request.account, btcTxs, signal), {
      limit: request.limit ?? defaultActivityPageSize,
      cursor: request.cursor,
    });
    const confirmed = await this.mapSourceItems(request.account, page.items, signal);
    const pending =
      request.cursor === undefined
        ? await this.getPendingActivity(request.account, btcTxs, confirmed, signal)
        : [];
    const items = await this.enrichQuotes([...pending, ...confirmed], signal);
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
        return [];
      default:
        return assertUnreachable(assetId.protocol);
    }
  }

  private async getBitcoinActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const btcTxs = this.bitcoinTransactionsService.getAccountTransactions(account, signal);
    const [txs, pending] = await Promise.all([btcTxs, this.getPendingBitcoinActivity(btcTxs)]);
    const confirmed = txs
      .filter(tx => tx.height !== undefined)
      .map(mapBitcoinActivity)
      .filter((activity): activity is BlockchainActivity => activity !== null)
      .sort(sortActivityByTimestampDesc);
    return this.enrichQuotes([...pending, ...confirmed], signal);
  }

  private async getStacksActivityByAssetId(
    account: AccountAddresses,
    assetId: CryptoAssetId,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const sourceItems = await this.getRecentStacksSourceItems(account, signal);
    const [confirmedAll, pendingAll] = await Promise.all([
      this.mapSourceItems(account, sourceItems, signal),
      this.getPendingStacksActivity(account, signal),
    ]);
    function matchesAsset(activity: BlockchainActivity) {
      return activity.balanceChanges.some(change => matchesAssetId(change.asset, assetId));
    }
    return this.enrichQuotes(
      [...pendingAll.filter(matchesAsset), ...confirmedAll.filter(matchesAsset)],
      signal
    );
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
        { cursor, limit: stxPageLimit },
        { signal }
      );
      for (const result of res.results) {
        items.push({
          txid: result.transaction.tx_id,
          chain: 'stacks',
          timestamp: result.transaction.block.time,
          raw: result,
        });
      }
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

  private async getPendingActivity(
    account: AccountAddresses,
    btcTxs: Promise<BitcoinTransaction[]>,
    confirmed: BlockchainActivity[],
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const confirmedTxids = new Set(confirmed.map(activity => activity.txid));
    const [stxPending, btcPending] = await Promise.all([
      this.getPendingStacksActivity(account, signal),
      this.getPendingBitcoinActivity(btcTxs),
    ]);
    return [...btcPending, ...stxPending].filter(activity => !confirmedTxids.has(activity.txid));
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

  private async mapPendingStacksTx(
    tx: StacksTx,
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivity | null> {
    const initiatedByUser = tx.sender_address === stxAddress;
    const common = {
      timestamp: 'receipt_time' in tx ? tx.receipt_time : 0,
      txid: tx.tx_id,
      status: 'pending' as const,
      initiatedByUser,
      ...(initiatedByUser ? { fee: createMoney(initBigNumber(tx.fee_rate), 'STX') } : {}),
    };

    switch (tx.tx_type) {
      case 'token_transfer': {
        const stxChange = buildStxBalanceChange(
          initiatedByUser ? `-${tx.token_transfer.amount}` : tx.token_transfer.amount
        );
        return buildStacksActivity({
          common,
          core: {
            kind: 'token_transfer',
            recipient: tx.token_transfer.recipient_address,
            sender: tx.sender_address,
          },
          action: initiatedByUser ? 'send' : 'receive',
          balanceChanges: stxChange === null ? [] : [stxChange],
        });
      }
      case 'smart_contract':
        return buildStacksActivity({
          common,
          core: { kind: 'smart_contract', contractId: tx.smart_contract.contract_id },
          action: 'contract-deploy',
          balanceChanges: [],
        });
      case 'contract_call': {
        const { action, protocol } = await this.classifyContractCall(
          tx.contract_call.contract_id,
          tx.contract_call.function_name,
          signal
        );
        return buildStacksActivity({
          common,
          core: {
            kind: 'contract_call',
            contractId: tx.contract_call.contract_id,
            functionName: tx.contract_call.function_name,
          },
          action,
          protocol,
          balanceChanges: [],
        });
      }
      default:
        return null;
    }
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
    if (!isStacksActivityResultItem(result)) return null;
    const tx = result.transaction;
    const initiatedByUser = result.involvement === 'sender';
    const stxChange = buildStxBalanceChange(result.balance_changes.stx.net);
    const balanceChanges = [...(stxChange === null ? [] : [stxChange]), ...ftChanges];
    const common = {
      timestamp: tx.block.time,
      txid: tx.tx_id,
      blockHeight: tx.block.height,
      status: mapStacksActivityStatus(tx.status),
      initiatedByUser,
      ...(initiatedByUser ? { fee: createMoney(initBigNumber(tx.fee_rate), 'STX') } : {}),
    };

    switch (tx.type) {
      case 'token_transfer':
        return buildStacksActivity({
          common,
          core: {
            kind: 'token_transfer',
            recipient: tx.token_transfer.recipient,
            sender: tx.sender.address,
          },
          action: initiatedByUser ? 'send' : 'receive',
          balanceChanges,
        });
      case 'smart_contract':
        return buildStacksActivity({
          common,
          core: { kind: 'smart_contract', contractId: tx.smart_contract.contract_id },
          action: 'contract-deploy',
          balanceChanges,
        });
      case 'contract_call': {
        const classified = await this.classifyContractCall(
          tx.contract_call.contract_id,
          tx.contract_call.function_name,
          signal
        );
        const { action, protocol } = reclassifySip10Transfer(
          classified,
          tx.contract_call.function_name,
          balanceChanges
        );
        return buildStacksActivity({
          common,
          core: {
            kind: 'contract_call',
            contractId: tx.contract_call.contract_id,
            functionName: tx.contract_call.function_name,
          },
          action,
          protocol,
          balanceChanges,
        });
      }
      default:
        return assertUnreachable(tx);
    }
  }

  private async classifyContractCall(
    contractId: string,
    functionName: string,
    signal?: AbortSignal
  ): Promise<{ action: StacksProtocolAction; protocol?: StacksProtocolId }> {
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
    return { action: action ?? 'contract-execution', protocol: protocol.id };
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
    const rows = (
      await Promise.all(
        batches.map(batch => this.fetchBalanceChangesBatch(principal, batch, signal))
      )
    ).flat();

    const resolved = await Promise.all(
      rows.filter(isFtBalanceChangeRow).map(async row => {
        const change = await this.resolveFtBalanceChange(
          row.asset.identifier,
          row.balance_change.net,
          signal
        );
        return change === null ? null : { txId: row.tx_id, change };
      })
    );

    const byTxId = new Map<string, BlockchainActivityBalanceChange[]>();
    for (const entry of resolved) {
      if (entry === null) continue;
      const list = byTxId.get(entry.txId) ?? [];
      list.push(entry.change);
      byTxId.set(entry.txId, list);
    }
    return byTxId;
  }

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

  private async resolveFtBalanceChange(
    assetIdentifier: string,
    net: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivityBalanceChange | null> {
    const amount = initBigNumber(net);
    if (amount.isZero()) return null;
    try {
      const asset = await this.sip10AssetService.getAsset(assetIdentifier, signal);
      return {
        direction: amount.isNegative() ? 'sent' : 'received',
        asset,
        amount: {
          crypto: createMoney(amount.abs(), asset.symbol, asset.decimals),
          quote: createMoney(0, 'USD'),
        },
      };
    } catch {
      return null;
    }
  }

  private async enrichQuotes(
    activities: BlockchainActivity[],
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const marketDataByKey = await this.fetchMarketData(activities, signal);
    return activities.map(activity => ({
      ...activity,
      balanceChanges: activity.balanceChanges.map(change => {
        if (change.asset.category !== 'fungible') return change;
        const marketData = marketDataByKey.get(assetQuoteKey(change.asset));
        if (marketData === undefined) return change;
        return {
          ...change,
          amount: {
            ...change.amount,
            quote: baseCurrencyAmountInQuoteWithFallback(change.amount.crypto, marketData),
          },
        };
      }),
    }));
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
        } catch {
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
      fetchAllBtc: async () => {
        const txs = await btcTxs;
        const items: ActivitySourceItem[] = [];
        for (const tx of txs) {
          if (tx.time === undefined) continue;
          items.push({ txid: tx.txid, chain: 'bitcoin', timestamp: tx.time, raw: tx });
        }
        return items;
      },
      fetchStxPage: async (cursor: string | null) => {
        if (!hasStacksAddress(account)) {
          return { items: [], currentCursor: cursor, nextCursor: null };
        }
        const res = await this.hiroStacksApiClient.getPrincipalTransactions(
          account.stacks.stxAddress,
          { cursor, limit: stxPageLimit },
          { signal }
        );
        const items: ActivitySourceItem[] = res.results.map(
          (result): ActivitySourceItem => ({
            txid: result.transaction.tx_id,
            chain: 'stacks',
            timestamp: result.transaction.block.time,
            raw: result,
          })
        );
        return { items, currentCursor: res.cursor.current, nextCursor: res.cursor.next };
      },
    };
  }
}
