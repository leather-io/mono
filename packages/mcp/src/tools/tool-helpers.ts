import BigNumber from 'bignumber.js';

import type { AccountAddresses } from '@leather.io/models';

import type { McpConfig } from '../config';
import { McpToolError } from '../errors';
import type { PairingStore } from '../pairing';
import type { PendingRequest, PendingRequestStore } from '../pending-requests';
import type { QuoteCache } from '../quote-cache';
import { toPlainJson } from '../serialize';

export interface ToolContext {
  config: McpConfig;
  pairing: PairingStore;
  requests: PendingRequestStore;
  quotes: QuoteCache;
}

interface ToolTextResult {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

export function jsonToolResult(value: unknown): ToolTextResult {
  return { content: [{ type: 'text', text: JSON.stringify(toPlainJson(value), null, 2) }] };
}

export function errorToolResult(error: unknown): ToolTextResult {
  const payload =
    error instanceof McpToolError
      ? { code: error.code, message: error.message }
      : {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : String(error),
        };
  return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: payload }) }] };
}

export function requireAccount(context: ToolContext): AccountAddresses {
  const pairing = context.pairing.load();
  if (!pairing)
    throw new McpToolError(
      'WALLET_NOT_PAIRED',
      'No wallet is paired. Call connect_wallet and have the user open the returned link.'
    );
  return pairing.account;
}

export function proposalToolResult(context: ToolContext, request: PendingRequest): ToolTextResult {
  return jsonToolResult({
    requestId: request.id,
    status: request.state,
    approvalUrl: `${context.config.baseUrl}/approve/${request.id}`,
    expiresAt: new Date(request.expiresAt).toISOString(),
    summary: request.summary,
    instructions:
      'Show the user the summary and have them open approvalUrl in their browser to review and approve in Leather. Poll check_request for the outcome. If the link is never opened the request expires.',
  });
}

export function parseAmountToBaseUnits(
  amount: string,
  decimals: number,
  symbol: string
): BigNumber {
  const value = new BigNumber(amount);
  if (!value.isFinite() || value.isLessThanOrEqualTo(0))
    throw new McpToolError(
      'INVALID_PARAMS',
      `Amount "${amount}" must be a positive decimal number in ${symbol}.`
    );
  const baseUnits = value.shiftedBy(decimals);
  if (!baseUnits.isInteger())
    throw new McpToolError(
      'INVALID_PARAMS',
      `Amount "${amount}" has more decimal places than ${symbol} supports (${decimals}).`
    );
  return baseUnits;
}

export function formatMoneyAmount(amount: BigNumber, decimals: number): string {
  return amount.shiftedBy(-decimals).toFixed();
}
