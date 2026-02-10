import { injectable } from 'inversify';
import { entries } from 'remeda';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type {
  FungibleCryptoAsset,
  FungibleCryptoAssetProtocol,
  MarketStats,
  TokenAnalytics,
} from '@leather.io/models';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { FungibleAssetVisibilityService } from '../assets/fungible-asset-visibility.service';
import { createRuneAsset } from '../assets/rune-asset.utils';
import { createSip10Asset } from '../assets/stacks-asset.utils';
import { BtcBalancesService } from '../balances/btc-balances.service';
import { RunesBalancesService } from '../balances/runes-balances.service';
import { Sip10BalancesService } from '../balances/sip10-balances.service';
import { StxBalancesService } from '../balances/stx-balances.service';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { MarketDataService } from '../market/market-data.service';
import { MarketStatsService } from '../market/market-stats.service';
import { TokenAnalyticsService } from '../token-analytics/token-analytics.service';
import type {
  AssetListItem,
  AssetListItemBalance,
  AssetListRequest,
  AssetListResponse,
  AssetListSortField,
} from './asset-list.types';
import {
  filterAssetsByChain,
  filterAssetsByProtocol,
  filterByDistributionScore,
  filterByHasBalance,
  filterByMarketCap,
  filterByTrendingScore,
  filterByTrustScore,
  paginateItems,
  sortAssetListItems,
} from './asset-list.utils';

@injectable()
export class AssetListService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetVisibilityService: FungibleAssetVisibilityService,
    private readonly marketDataService: MarketDataService,
    private readonly marketStatsService: MarketStatsService,
    private readonly tokenAnalyticsService: TokenAnalyticsService,
    private readonly btcBalancesService: BtcBalancesService,
    private readonly stxBalancesService: StxBalancesService,
    private readonly sip10BalancesService: Sip10BalancesService,
    private readonly runesBalancesService: RunesBalancesService
  ) {}

  async getAssetList(request: AssetListRequest, signal?: AbortSignal): Promise<AssetListResponse> {
    const { filters, includes, sort, pagination } = request;

    const sortFields = new Set<AssetListSortField>(sort?.map(s => s.field));
    const sortNeedsMarketStats =
      sortFields.has('marketCap') ||
      sortFields.has('change1d') ||
      sortFields.has('change1w') ||
      sortFields.has('change1m');
    const sortNeedsAnalytics =
      sortFields.has('trustScore') ||
      sortFields.has('trendingScore') ||
      sortFields.has('distributionScore') ||
      sortFields.has('holderCount');
    const sortNeedsBalance =
      sortFields.has('quoteTotalBalance') || sortFields.has('quoteAvailableBalance');
    const sortNeedsMarketData = sortFields.has('price');

    let assets = await this.fetchBaseAssets(filters?.protocols, signal);

    if (filters?.protocols) {
      assets = assets.filter(filterAssetsByProtocol(filters.protocols));
    }
    if (filters?.chain) {
      assets = assets.filter(filterAssetsByChain(filters.chain));
    }

    if (!filters?.includeHidden) {
      assets = await this.filterByVisibility(assets, signal);
    }

    const needsMarketStats =
      filters?.minMarketCap !== undefined || includes?.marketStats || sortNeedsMarketStats;
    const needsAnalytics =
      filters?.minTrustScore !== undefined ||
      filters?.minTrendingScore !== undefined ||
      filters?.minDistributionScore !== undefined ||
      includes?.analytics ||
      sortNeedsAnalytics;
    const needsBalance = includes?.balance || filters?.hasBalance || sortNeedsBalance;
    const needsMarketData = includes?.marketData || sortNeedsMarketData;

    const marketStatsMap = needsMarketStats
      ? await this.fetchMarketStatsMap(assets, signal)
      : new Map<SerializedCryptoAssetId, MarketStats>();

    const analyticsMap = needsAnalytics
      ? await this.fetchAnalyticsMap(assets, signal)
      : new Map<SerializedCryptoAssetId, TokenAnalytics>();

    let items: AssetListItem[] = assets.map(asset => {
      const id = serializeAssetId(getAssetId(asset));
      return {
        id,
        asset,
        marketStats: marketStatsMap.get(id) ?? undefined,
        analytics: analyticsMap.get(id) ?? undefined,
      };
    });

    if (filters?.minMarketCap !== undefined) {
      items = items.filter(filterByMarketCap(filters.minMarketCap));
    }
    if (filters?.minTrustScore !== undefined) {
      items = items.filter(filterByTrustScore(filters.minTrustScore));
    }
    if (filters?.minTrendingScore !== undefined) {
      items = items.filter(filterByTrendingScore(filters.minTrendingScore));
    }
    if (filters?.minDistributionScore !== undefined) {
      items = items.filter(filterByDistributionScore(filters.minDistributionScore));
    }

    const balanceMap = needsBalance
      ? await this.fetchBalanceMap(assets, request, signal)
      : new Map<SerializedCryptoAssetId, AssetListItemBalance>();

    if (needsBalance) {
      items = items.map(item => ({
        ...item,
        balance: balanceMap.get(item.id) ?? undefined,
      }));
    }

    if (filters?.hasBalance) {
      items = items.filter(filterByHasBalance);
    }

    if (needsMarketData) {
      items = await this.hydrateMarketData(items, assets, signal);
    }

    if (sort?.length) {
      items = sortAssetListItems(items, sort);
    }

    const total = items.length;

    if (pagination) {
      items = paginateItems(items, pagination);
    }

    if (!includes?.marketStats) {
      items = items.map(item => ({ ...item, marketStats: undefined }));
    }
    if (!includes?.analytics) {
      items = items.map(item => ({ ...item, analytics: undefined }));
    }
    if (!includes?.marketData) {
      items = items.map(item => ({ ...item, marketData: undefined }));
    }
    if (!includes?.balance) {
      items = items.map(item => ({ ...item, balance: undefined }));
    }

    return {
      items,
      meta: {
        total,
        limit: pagination?.limit ?? total,
        offset: pagination?.offset ?? 0,
      },
    };
  }

  private async fetchBaseAssets(
    protocols?: FungibleCryptoAssetProtocol[],
    signal?: AbortSignal
  ): Promise<FungibleCryptoAsset[]> {
    const includeAll = !protocols;

    const fetchSip10 = includeAll || protocols.includes('sip10');
    const fetchRune = includeAll || protocols.includes('rune');

    const [sip10Map, runeMap] = await Promise.all([
      fetchSip10 ? this.leatherApiClient.fetchSip10TokenMap({ signal }) : null,
      fetchRune ? this.leatherApiClient.fetchRuneMap({ signal }) : null,
    ]);

    const assets: FungibleCryptoAsset[] = [];

    if (includeAll || protocols.includes('nativeBtc')) {
      assets.push(btcAsset);
    }
    if (includeAll || protocols.includes('nativeStx')) {
      assets.push(stxAsset);
    }

    if (sip10Map) {
      for (const [principal, token] of entries(sip10Map)) {
        assets.push(createSip10Asset({ ...token, principal }));
      }
    }

    if (runeMap) {
      for (const [runeName, rune] of entries(runeMap)) {
        assets.push(createRuneAsset(runeName, rune.spacedRuneName, rune.decimals, rune.symbol));
      }
    }

    return assets;
  }

  private async filterByVisibility(
    assets: FungibleCryptoAsset[],
    signal?: AbortSignal
  ): Promise<FungibleCryptoAsset[]> {
    const results = await Promise.all(
      assets.map(async asset => ({
        asset,
        isVisible: await this.fungibleAssetVisibilityService.isAssetVisible(asset, signal),
      }))
    );
    return results.filter(r => r.isVisible).map(r => r.asset);
  }

  private async fetchMarketStatsMap(
    assets: FungibleCryptoAsset[],
    signal?: AbortSignal
  ): Promise<Map<SerializedCryptoAssetId, MarketStats>> {
    const results = await Promise.all(
      assets.map(async asset => {
        try {
          const stats = await this.marketStatsService.getMarketStats(asset, signal);
          return { id: serializeAssetId(getAssetId(asset)), stats };
        } catch {
          return null;
        }
      })
    );

    const map = new Map<SerializedCryptoAssetId, MarketStats>();
    for (const result of results) {
      if (result?.stats) {
        map.set(result.id, result.stats);
      }
    }
    return map;
  }

  private async fetchAnalyticsMap(
    assets: FungibleCryptoAsset[],
    signal?: AbortSignal
  ): Promise<Map<SerializedCryptoAssetId, TokenAnalytics>> {
    const results = await Promise.all(
      assets.map(async asset => {
        try {
          const analytics = await this.tokenAnalyticsService.getAnalytics(asset, signal);
          return { id: serializeAssetId(getAssetId(asset)), analytics };
        } catch {
          return null;
        }
      })
    );

    const map = new Map<SerializedCryptoAssetId, TokenAnalytics>();
    for (const result of results) {
      if (result?.analytics) {
        map.set(result.id, result.analytics);
      }
    }
    return map;
  }

  private async fetchBalanceMap(
    assets: FungibleCryptoAsset[],
    request: AssetListRequest,
    signal?: AbortSignal
  ): Promise<Map<SerializedCryptoAssetId, AssetListItemBalance>> {
    const map = new Map<SerializedCryptoAssetId, AssetListItemBalance>();
    if (!request.accountContext) return map;

    const accountRequest = request.accountContext;
    const protocolSet = new Set(assets.map(a => a.protocol));

    const [btcResult, stxResult, sip10Result, runesResult] = await Promise.all([
      protocolSet.has('nativeBtc')
        ? this.btcBalancesService.getBtcAccountBalance(accountRequest, signal).catch(() => null)
        : null,
      protocolSet.has('nativeStx')
        ? this.stxBalancesService.getStxAccountBalance(accountRequest, signal).catch(() => null)
        : null,
      protocolSet.has('sip10')
        ? this.sip10BalancesService.getSip10AccountBalance(accountRequest, signal).catch(() => null)
        : null,
      protocolSet.has('rune')
        ? this.runesBalancesService.getRunesAccountBalance(accountRequest, signal).catch(() => null)
        : null,
    ]);

    if (btcResult) {
      map.set(serializeAssetId({ protocol: 'nativeBtc', id: 'BTC' }), {
        crypto: btcResult.btc,
        quote: btcResult.quote,
      });
    }

    if (stxResult) {
      map.set(serializeAssetId({ protocol: 'nativeStx', id: 'STX' }), {
        crypto: stxResult.stx,
        quote: stxResult.quote,
      });
    }

    if (sip10Result) {
      for (const sip10 of sip10Result.sip10s) {
        map.set(serializeAssetId({ protocol: 'sip10', id: sip10.asset.assetId }), {
          crypto: sip10.crypto,
          quote: sip10.quote,
        });
      }
    }

    if (runesResult) {
      for (const rune of runesResult.runes) {
        map.set(serializeAssetId({ protocol: 'rune', id: rune.asset.runeName }), {
          crypto: rune.crypto,
          quote: rune.quote,
        });
      }
    }

    return map;
  }

  private async hydrateMarketData(
    items: AssetListItem[],
    assets: FungibleCryptoAsset[],
    signal?: AbortSignal
  ): Promise<AssetListItem[]> {
    const assetById = new Map<SerializedCryptoAssetId, FungibleCryptoAsset>();
    for (const asset of assets) {
      assetById.set(serializeAssetId(getAssetId(asset)), asset);
    }

    const hydrated = await Promise.all(
      items.map(async item => {
        const asset = assetById.get(item.id);
        if (!asset) return item;
        try {
          const marketData = await this.marketDataService.getMarketData(asset, signal);
          return { ...item, marketData };
        } catch {
          return item;
        }
      })
    );

    return hydrated;
  }
}
