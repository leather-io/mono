import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { postConditionToHex, serializeCV } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import { z } from 'zod';

import type { AccountAddresses, Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { clarityValueSchema } from '@leather.io/rpc';
import { getBnsService, getSwapService } from '@leather.io/services';

import { resolveFungibleAsset } from '../asset-resolver';
import { McpToolError } from '../errors';
import {
  type ToolContext,
  errorToolResult,
  formatMoneyAmount,
  parseAmountToBaseUnits,
  proposalToolResult,
  requireAccount,
} from './tool-helpers';

const defaultSlippagePercent = 3;
const maxSafeIntegerAmount = new BigNumber(Number.MAX_SAFE_INTEGER);

const ftAssetIdentifierSchema = z.custom<`${string}.${string}::${string}`>(
  value => typeof value === 'string' && /.+\..+::.+/.test(value),
  'Expected a fully-qualified asset identifier like "SP123....contract::token"'
);

const amountConditionSchema = z.enum(['eq', 'gt', 'gte', 'lt', 'lte']);
const integerAmountSchema = z.union([z.string().regex(/^\d+$/), z.number().int().nonnegative()]);

const postConditionSchema = z.union([
  z.object({
    type: z.literal('stx-postcondition'),
    address: z.string(),
    condition: amountConditionSchema,
    amount: integerAmountSchema,
  }),
  z.object({
    type: z.literal('ft-postcondition'),
    address: z.string(),
    condition: amountConditionSchema,
    amount: integerAmountSchema,
    asset: ftAssetIdentifierSchema,
  }),
  z.object({
    type: z.literal('nft-postcondition'),
    address: z.string(),
    condition: z.enum(['sent', 'not-sent']),
    asset: ftAssetIdentifierSchema,
    assetId: clarityValueSchema,
  }),
]);

function toIntegerAmount(baseUnits: BigNumber, symbol: string): number {
  if (baseUnits.isGreaterThan(maxSafeIntegerAmount))
    throw new McpToolError('INVALID_PARAMS', `Amount in ${symbol} base units is too large.`);
  return baseUnits.toNumber();
}

function serializeClarityArg(arg: unknown, label: string): string {
  if (typeof arg === 'string') return arg;
  const parsed = clarityValueSchema.safeParse(arg);
  if (!parsed.success)
    throw new McpToolError(
      'INVALID_PARAMS',
      `${label} is not a valid Clarity value. Use typed JSON like { "type": "uint", "value": "100" } or { "type": "address", "value": "SP..." }.`
    );
  return serializeCV(parsed.data);
}

function serializePostConditionArg(arg: unknown, label: string): string {
  if (typeof arg === 'string') return arg;
  const parsed = postConditionSchema.safeParse(arg);
  if (!parsed.success)
    throw new McpToolError(
      'INVALID_PARAMS',
      `${label} is not a valid post-condition. Use shapes like { "type": "stx-postcondition", "address": "SP...", "condition": "gte", "amount": "100" }.`
    );
  return postConditionToHex(parsed.data);
}

async function resolveStacksRecipient(recipient: string, signal?: AbortSignal) {
  const trimmed = recipient.trim();
  if (/^S[PM][0-9A-Z]+(\.[a-zA-Z0-9-]+)?$/.test(trimmed))
    return { address: trimmed, resolvedFrom: undefined };
  if (trimmed.includes('.')) {
    const bnsName = await getBnsService().getBnsName(trimmed, signal);
    if (!bnsName)
      throw new McpToolError(
        'NAME_NOT_FOUND',
        `"${trimmed}" is neither a Stacks address nor a registered BNS name.`
      );
    return { address: bnsName.owner, resolvedFrom: trimmed };
  }
  throw new McpToolError(
    'INVALID_PARAMS',
    `Recipient "${trimmed}" is not a valid Stacks address or BNS name.`
  );
}

function requireStacksAddress(account: AccountAddresses): string {
  const stxAddress = account.stacks?.stxAddress;
  if (!stxAddress)
    throw new McpToolError('INVALID_PARAMS', 'The paired account has no Stacks address.');
  return stxAddress;
}

function formatMoney(money: Money): string {
  return `${formatMoneyAmount(money.amount, money.decimals)} ${money.symbol}`;
}

function swapAssetRef(asset: SwappableFungibleCryptoAsset): string {
  return asset.protocol === 'sip10' ? asset.assetId : asset.symbol;
}

export function registerProposeTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'send_asset',
    {
      title: 'Propose a send',
      description:
        'Proposes sending BTC, STX, or a SIP-10 token from the paired account. Returns an approval link immediately; nothing moves until the user approves in Leather. BNS-name recipients are resolved for STX-family sends only.',
      inputSchema: {
        asset: z.string().describe('"BTC", "STX", or SIP-10 contract id'),
        amount: z.string().describe('Amount in human units, e.g. "0.5"'),
        recipient: z.string().describe('Destination address, or BNS name for STX-family sends'),
        memo: z.string().max(34).optional().describe('Optional memo, STX transfers only'),
      },
    },
    async (args, extra) => {
      try {
        const account = requireAccount(context);
        const assetInput = args.asset.trim().toUpperCase();

        if (assetInput === 'BTC') {
          if (!account.bitcoin)
            throw new McpToolError(
              'INVALID_PARAMS',
              'The paired account has no Bitcoin addresses.'
            );
          if (args.recipient.includes('.'))
            throw new McpToolError(
              'INVALID_PARAMS',
              'BNS names are not supported for BTC sends. Provide a Bitcoin address.'
            );
          const sats = parseAmountToBaseUnits(args.amount, 8, 'BTC');
          const request = context.requests.create({
            kind: 'send',
            summary: `Send ${args.amount} BTC to ${args.recipient}`,
            rpcMethod: 'sendTransfer',
            rpcParams: {
              recipients: [{ address: args.recipient.trim(), amount: sats.toFixed() }],
              network: 'mainnet',
            },
            affectedAssets: ['BTC'],
          });
          return proposalToolResult(context, request);
        }

        requireStacksAddress(account);
        const recipient = await resolveStacksRecipient(args.recipient, extra.signal);
        const resolvedNote = recipient.resolvedFrom ? ` (${recipient.resolvedFrom})` : '';

        if (assetInput === 'STX') {
          const microStx = parseAmountToBaseUnits(args.amount, 6, 'STX');
          const request = context.requests.create({
            kind: 'send',
            summary: `Send ${args.amount} STX to ${recipient.address}${resolvedNote}`,
            rpcMethod: 'stx_transferStx',
            rpcParams: {
              recipient: recipient.address,
              amount: toIntegerAmount(microStx, 'STX'),
              memo: args.memo,
              network: 'mainnet',
            },
            affectedAssets: ['STX'],
          });
          return proposalToolResult(context, request);
        }

        const asset = await resolveFungibleAsset(args.asset, extra.signal);
        if (asset.protocol !== 'sip10')
          throw new McpToolError('UNSUPPORTED_ASSET', `Cannot send "${args.asset}".`);
        const baseUnits = parseAmountToBaseUnits(args.amount, asset.decimals, asset.symbol);
        const request = context.requests.create({
          kind: 'send',
          summary: `Send ${args.amount} ${asset.symbol} to ${recipient.address}${resolvedNote}`,
          rpcMethod: 'stx_transferSip10Ft',
          rpcParams: {
            recipient: recipient.address,
            asset: asset.assetId,
            amount: toIntegerAmount(baseUnits, asset.symbol),
            network: 'mainnet',
          },
          affectedAssets: [asset.assetId],
        });
        return proposalToolResult(context, request);
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'call_contract',
    {
      title: 'Propose a contract call',
      description:
        'Proposes a Stacks contract call from the paired account. Function arguments are typed Clarity JSON (e.g. { "type": "uint", "value": "100" }); post-conditions are optional structured objects. Returns an approval link immediately; the user reviews and approves in Leather.',
      inputSchema: {
        contract: z
          .string()
          .refine(value => value.includes('.'), 'Expected "SPADDRESS.contract-name"')
          .describe('Contract id, e.g. "SP123....my-contract"'),
        functionName: z.string(),
        functionArgs: z
          .array(z.unknown())
          .optional()
          .describe('Typed Clarity JSON values, in order'),
        postConditions: z
          .array(z.unknown())
          .optional()
          .describe('Structured post-conditions protecting the user'),
        postConditionMode: z.enum(['allow', 'deny']).optional(),
      },
    },
    args => {
      try {
        requireStacksAddress(requireAccount(context));
        const functionArgs = (args.functionArgs ?? []).map((arg, index) =>
          serializeClarityArg(arg, `functionArgs[${index}]`)
        );
        const postConditions = (args.postConditions ?? []).map((pc, index) =>
          serializePostConditionArg(pc, `postConditions[${index}]`)
        );
        const request = context.requests.create({
          kind: 'contract-call',
          summary: `Call ${args.contract} ${args.functionName}(${functionArgs.length} args)`,
          rpcMethod: 'stx_callContract',
          rpcParams: {
            contract: args.contract.trim(),
            functionName: args.functionName,
            functionArgs,
            postConditions: postConditions.length ? postConditions : undefined,
            postConditionMode: args.postConditionMode,
            network: 'mainnet',
          },
        });
        return proposalToolResult(context, request);
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'swap',
    {
      title: 'Propose a swap',
      description:
        'Proposes executing a swap quote previously returned by get_swap_quotes. A minimum-receive post-condition derived from the slippage limit protects the user. Returns an approval link immediately; the user reviews and approves in Leather.',
      inputSchema: {
        quoteId: z.string().describe('quoteId from get_swap_quotes'),
        slippagePercent: z
          .number()
          .positive()
          .max(50)
          .optional()
          .describe('Max slippage percent (default 3)'),
      },
    },
    async (args, extra) => {
      try {
        const account = requireAccount(context);
        requireStacksAddress(account);
        const quote = context.quotes.getOrThrow(args.quoteId);
        if (!quote.isExecutable)
          throw new McpToolError(
            'UNSUPPORTED_ROUTE',
            `This quote is not executable: ${JSON.stringify(quote.executionConstraints)}`
          );
        const slippagePercent = args.slippagePercent ?? defaultSlippagePercent;
        const slippageFraction = new BigNumber(slippagePercent).dividedBy(100);
        const executionData = await getSwapService().getSwapExecutionData(
          { account },
          quote,
          slippageFraction,
          extra.signal
        );
        if (executionData.executionType !== 'stacks-contract-call')
          throw new McpToolError(
            'UNSUPPORTED_ROUTE',
            'Only Stacks contract-call swaps are supported. sBTC bridge swaps are not available through this tool.'
          );
        const functionArgs = executionData.functionArgs.map((arg, index) =>
          serializeClarityArg(arg, `provider functionArgs[${index}]`)
        );
        const postConditions = executionData.postConditions.map((pc, index) =>
          serializePostConditionArg(pc, `provider postConditions[${index}]`)
        );
        const postConditionMode =
          executionData.postConditionMode === 'allow' || executionData.postConditionMode === 'deny'
            ? executionData.postConditionMode
            : undefined;
        const request = context.requests.create({
          kind: 'swap',
          summary: `Swap ${formatMoney(quote.baseAmount)} for ~${formatMoney(quote.targetAmount)} via ${quote.providerId} (max slippage ${slippagePercent}%)`,
          rpcMethod: 'stx_callContract',
          rpcParams: {
            contract: `${executionData.contractAddress}.${executionData.contractName}`,
            functionName: executionData.functionName,
            functionArgs,
            postConditions,
            postConditionMode,
            network: 'mainnet',
          },
          affectedAssets: [swapAssetRef(quote.baseAsset), swapAssetRef(quote.targetAsset)],
        });
        return proposalToolResult(context, request);
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );
}
