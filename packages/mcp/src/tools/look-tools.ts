import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import BigNumber from 'bignumber.js';
import { z } from 'zod';

import type { AccountAddresses } from '@leather.io/models';
import {
  type ActivityRequest,
  type AssetListSortField,
  getAssetListService,
  getBitcoinTransactionsService,
  getBlockchainActivityService,
  getBnsService,
  getBtcBalancesService,
  getMarketDataService,
  getMarketStatsService,
  getSip10BalancesService,
  getStacksTransactionsService,
  getStxBalancesService,
  getSwapService,
  getYieldService,
} from '@leather.io/services';
import { createMoneyFromDecimal } from '@leather.io/utils';

import { resolveFungibleAsset, resolveSwapPair } from '../asset-resolver';
import { McpToolError } from '../errors';
import { decodeCursor, encodeCursor } from '../serialize';
import {
  buildBalancesView,
  buildBtcBalanceView,
  buildSip10TokenView,
  buildStxBalanceView,
} from '../views/balances.view';
import {
  buildBitcoinTxStatusView,
  buildStacksTxStatusView,
} from '../views/transaction-status.view';
import { type ToolContext, errorToolResult, jsonToolResult, requireAccount } from './tool-helpers';

const assetListSortFields: [AssetListSortField, ...AssetListSortField[]] = [
  'name',
  'marketCap',
  'quoteTotalBalance',
  'quoteAvailableBalance',
  'change1d',
  'change1w',
  'change1m',
  'trustScore',
  'trendingScore',
  'distributionScore',
  'price',
  'holderCount',
];

function launderCursor(value: unknown): ActivityRequest['cursor'];
function launderCursor(value: unknown): unknown {
  return value;
}

const txStatusPollIntervalMs = 5_000;
const txidPattern = /^(0x)?[0-9a-fA-F]{64}$/;

interface AccountBalanceRequest {
  account: AccountAddresses;
}

async function fetchAssetBalanceEntry(
  request: AccountBalanceRequest,
  requested: string,
  signal: AbortSignal
) {
  try {
    const upper = requested.trim().toUpperCase();
    if (upper === 'BTC')
      return {
        symbol: 'BTC',
        ...buildBtcBalanceView(await getBtcBalancesService().getBtcAccountBalance(request, signal)),
      };
    if (upper === 'STX')
      return {
        symbol: 'STX',
        ...buildStxBalanceView(await getStxBalancesService().getStxAccountBalance(request, signal)),
      };
    if (requested.includes('::'))
      return buildSip10TokenView(
        await getSip10BalancesService().getSip10BalanceByAssetId(request, requested, signal)
      );
    if (requested.includes('.')) {
      const balance = await getSip10BalancesService().getSip10BalanceByContractId(
        request,
        requested,
        signal
      );
      return balance ? buildSip10TokenView(balance) : { requested, status: 'not_found' };
    }
    const aggregate = await getSip10BalancesService().getSip10AccountBalance(request, signal);
    const match = aggregate.sip10s.find(balance => balance.asset.symbol.toUpperCase() === upper);
    return match ? buildSip10TokenView(match) : { requested, status: 'not_found' };
  } catch {
    return { requested, status: 'not_found' };
  }
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function fetchTransactionStatusView(
  chain: 'stacks' | 'bitcoin',
  txid: string,
  signal: AbortSignal
) {
  if (chain === 'stacks')
    return buildStacksTxStatusView(
      txid,
      await getStacksTransactionsService().getTransactionById(txid, signal)
    );
  return buildBitcoinTxStatusView(
    txid,
    await getBitcoinTransactionsService().getTransactionByTxId(txid, signal)
  );
}

export function registerLookTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'get_balances',
    {
      title: 'Get balances',
      description:
        'Balances for the paired account: fiat totals plus per-chain BTC, STX, and per-token SIP-10 holdings sorted by fiat value. Pass assets to get only specific assets — use this after a transaction to report just what changed. Amounts are decimal strings in human units; optional fields (locked, unconfirmedInbound, unconfirmedOutbound, dust) appear only when nonzero. For per-asset metadata and analytics use list_assets. Read-only.',
      inputSchema: {
        assets: z
          .array(z.string())
          .min(1)
          .optional()
          .describe(
            'Only these assets: "BTC", "STX", a SIP-10 symbol, contract id, or assetId. Omit for the full wallet view.'
          ),
      },
    },
    async (args, extra) => {
      try {
        const account = requireAccount(context);
        const request = { account };
        if (args.assets) {
          const entries = await Promise.all(
            args.assets.map(asset => fetchAssetBalanceEntry(request, asset, extra.signal))
          );
          return jsonToolResult({ assets: entries });
        }
        const [btc, stx, sip10] = await Promise.all([
          getBtcBalancesService().getBtcAccountBalance(request, extra.signal),
          getStxBalancesService().getStxAccountBalance(request, extra.signal),
          getSip10BalancesService().getSip10AccountBalance(request, extra.signal),
        ]);
        return jsonToolResult(buildBalancesView({ btc, stx, sip10 }));
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'list_assets',
    {
      title: 'List assets',
      description:
        'Lists fungible assets with balances, market data, and analytics for the paired account. Supports filtering, sorting, and pagination. Read-only.',
      inputSchema: {
        chain: z.enum(['bitcoin', 'stacks']).optional(),
        protocols: z.array(z.enum(['nativeBtc', 'nativeStx', 'sip10'])).optional(),
        hasBalance: z.boolean().optional().describe('Only assets the account holds (default true)'),
        minMarketCap: z.number().optional(),
        includeAnalytics: z
          .boolean()
          .optional()
          .describe('Include trust/trending/distribution scores'),
        sortBy: z.enum(assetListSortFields).optional(),
        sortDirection: z.enum(['asc', 'desc']).optional(),
        limit: z.number().int().positive().max(100).optional(),
        offset: z.number().int().nonnegative().optional(),
      },
    },
    async (args, extra) => {
      try {
        const account = requireAccount(context);
        const response = await getAssetListService().getAssetList(
          {
            filters: {
              chain: args.chain,
              protocols: args.protocols,
              hasBalance: args.hasBalance ?? true,
              minMarketCap: args.minMarketCap,
            },
            includes: {
              balance: true,
              marketData: true,
              analytics: args.includeAnalytics ?? false,
            },
            sort: args.sortBy
              ? [{ field: args.sortBy, direction: args.sortDirection ?? 'desc' }]
              : undefined,
            pagination: { limit: args.limit ?? 50, offset: args.offset ?? 0 },
            accountContext: { account },
          },
          extra.signal
        );
        return jsonToolResult(response);
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'get_activity',
    {
      title: 'Get activity',
      description:
        'Cursor-paged transaction activity for the paired account across Bitcoin and Stacks, newest first, pending included on the first page. Pass nextCursor back to fetch the next page. Read-only.',
      inputSchema: {
        limit: z.number().int().positive().max(50).optional(),
        cursor: z.string().optional().describe('Opaque cursor from a previous response'),
      },
    },
    async (args, extra) => {
      try {
        const account = requireAccount(context);
        const cursor = args.cursor ? launderCursor(decodeCursor(args.cursor)) : undefined;
        const response = await getBlockchainActivityService().getActivity(
          { account, limit: args.limit, cursor },
          extra.signal
        );
        return jsonToolResult({
          items: response.items,
          hasMore: response.hasMore,
          nextCursor: response.nextCursor ? encodeCursor(response.nextCursor) : null,
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'get_transaction_status',
    {
      title: 'Get transaction status',
      description:
        'Looks up the on-chain status of a transaction by txid: confirmed, pending, failed (with reason), or not_found. Pass waitSeconds to block until the transaction leaves pending — use this after a proposal is approved to report the final on-chain result, since an approved transaction can still fail on-chain. Stacks txids are 0x-prefixed; chain is inferred from the txid unless given. Read-only, works without a paired wallet.',
      inputSchema: {
        txid: z.string(),
        chain: z.enum(['stacks', 'bitcoin']).optional(),
        waitSeconds: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe(
            'Block up to this many seconds while the transaction is pending or not yet indexed'
          ),
      },
    },
    async (args, extra) => {
      try {
        if (!txidPattern.test(args.txid))
          throw new McpToolError('INVALID_PARAMS', `"${args.txid}" is not a valid transaction id.`);
        const chain = args.chain ?? (args.txid.startsWith('0x') ? 'stacks' : 'bitcoin');
        const txid =
          chain === 'stacks' && !args.txid.startsWith('0x') ? `0x${args.txid}` : args.txid;
        const deadline = Date.now() + (args.waitSeconds ?? 0) * 1000;
        let view = await fetchTransactionStatusView(chain, txid, extra.signal);
        while (
          (view.status === 'pending' || view.status === 'not_found') &&
          Date.now() < deadline &&
          !extra.signal.aborted
        ) {
          await delay(Math.min(txStatusPollIntervalMs, deadline - Date.now()));
          view = await fetchTransactionStatusView(chain, txid, extra.signal);
        }
        return jsonToolResult(view);
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'get_market_data',
    {
      title: 'Get market data',
      description:
        'Current USD price and market stats (market cap, supply, period changes) for an asset. Accepts "BTC", "STX", or a SIP-10 contract id. Read-only, works without a paired wallet.',
      inputSchema: {
        asset: z.string().describe('"BTC", "STX", or SIP-10 contract id'),
      },
    },
    async (args, extra) => {
      try {
        const asset = await resolveFungibleAsset(args.asset, extra.signal);
        const [marketData, marketStats] = await Promise.all([
          getMarketDataService().getMarketData(asset, extra.signal),
          getMarketStatsService().getMarketStats(asset, extra.signal),
        ]);
        return jsonToolResult({
          asset: { symbol: asset.symbol, protocol: asset.protocol },
          marketData,
          marketStats,
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'get_swap_quotes',
    {
      title: 'Get swap quotes',
      description:
        'Fetches swap quotes from all providers (Velar, Alex, Bitflow) for a pair. Each quote has a quoteId; present the options to the user, then pass the chosen quoteId to the swap tool. Quotes expire after a few minutes. Read-only.',
      inputSchema: {
        from: z.string().describe('Asset to sell: symbol or SIP-10 contract id'),
        to: z.string().describe('Asset to buy: symbol or SIP-10 contract id'),
        amount: z.string().describe('Amount to sell, as a decimal string in human units'),
      },
    },
    async (args, extra) => {
      try {
        const { base, target } = await resolveSwapPair(args.from, args.to, extra.signal);
        const amount = new BigNumber(args.amount);
        if (!amount.isFinite() || amount.isLessThanOrEqualTo(0))
          throw new McpToolError('INVALID_PARAMS', `Amount "${args.amount}" must be positive.`);
        const baseAmount = createMoneyFromDecimal(amount, base.asset.symbol, base.asset.decimals);
        const quotes = await getSwapService().getSwapQuotes(base, target, baseAmount, extra.signal);
        return jsonToolResult({
          quotes: quotes.map(quote => ({
            quoteId: context.quotes.put(quote),
            provider: quote.providerId,
            baseAmount: quote.baseAmount,
            expectedTargetAmount: quote.targetAmount,
            executable: quote.isExecutable,
            executionConstraints: quote.executionConstraints,
            route: quote.assetPath.map(pathAsset => pathAsset.symbol),
          })),
          hint: 'Pass the chosen quoteId to the swap tool to propose the swap for user approval.',
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'resolve_name',
    {
      title: 'Resolve BNS name',
      description:
        'Resolves a BNS name (e.g. "alex.btc") to its Stacks address, or finds the primary BNS name for a Stacks address. Read-only, works without a paired wallet.',
      inputSchema: {
        name: z.string().optional().describe('Full BNS name to resolve to an address'),
        address: z.string().optional().describe('Stacks address to reverse-resolve'),
      },
    },
    async (args, extra) => {
      try {
        if (Boolean(args.name) === Boolean(args.address))
          throw new McpToolError('INVALID_PARAMS', 'Pass exactly one of name or address.');
        if (args.name) {
          const bnsName = await getBnsService().getBnsName(args.name, extra.signal);
          if (!bnsName)
            throw new McpToolError('NAME_NOT_FOUND', `BNS name "${args.name}" was not found.`);
          return jsonToolResult({ fullName: bnsName.fullName, address: bnsName.owner });
        }
        const primary = await getBnsService().getAddressPrimaryBnsName(
          args.address ?? '',
          extra.signal
        );
        return jsonToolResult({ address: args.address, primaryName: primary?.fullName ?? null });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'get_defi_positions',
    {
      title: 'Get DeFi positions',
      description:
        'DeFi yield positions held by the paired account across StackingDAO, Zest, Granite, and Bitflow. Read-only.',
      inputSchema: {},
    },
    async (_args, extra) => {
      try {
        const account = requireAccount(context);
        const positions = await getYieldService().getAllPositions(account, extra.signal);
        return jsonToolResult({ positions });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );
}
