import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { PendingRequest } from '../pending-requests';
import { type ToolContext, errorToolResult, jsonToolResult } from './tool-helpers';

function connectInstructions(request: PendingRequest): string | undefined {
  if (request.state === 'approved')
    return 'Pairing approved. Tell the user their wallet is connected and show them the paired addresses from get_wallet_status.';
  if (request.state === 'rejected')
    return 'The user rejected the pairing in Leather. Tell them; only retry if they ask.';
  return undefined;
}

function proposeInstructions(request: PendingRequest): string | undefined {
  switch (request.state) {
    case 'approved': {
      const balanceStep = request.affectedAssets?.length
        ? ` once confirmed, call get_balances with assets: ${JSON.stringify(request.affectedAssets)} and report those updated balances — do not estimate them, and do not list unrelated assets.`
        : ' report the confirmation to the user.';
      return `The user approved and the wallet has signed and broadcast the transaction. Tell them now, including the txid from result. Then call get_transaction_status with waitSeconds: 50 until it leaves pending;${balanceStep}`;
    }
    case 'rejected':
      return 'The user rejected the transaction in the wallet. Tell them; do not create a new request unless they ask.';
    case 'failed':
      return 'The wallet reported an error before broadcast; nothing was sent. Tell the user what the error says.';
    case 'expired':
      return 'The request expired before the user acted; nothing was sent. Offer to create a fresh one.';
    default:
      return undefined;
  }
}

function requestView(context: ToolContext, requestId: string) {
  const request = context.requests.getOrThrow(requestId);
  const instructions =
    request.kind === 'connect' ? connectInstructions(request) : proposeInstructions(request);
  return {
    requestId: request.id,
    kind: request.kind,
    status: request.state,
    summary: request.summary,
    result: request.result,
    error: request.error,
    expiresAt: new Date(request.expiresAt).toISOString(),
    instructions,
  };
}

export function registerRequestTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'check_request',
    {
      title: 'Check a pending request',
      description:
        'Checks the status of a connect or propose request: pending, opened, approved (with txid), rejected, failed, expired, or cancelled. Pass waitSeconds to block until the user acts — the call returns the moment the request reaches a terminal state, or with the current state once the wait elapses; call again while it is still pending. Requests do not survive a server restart.',
      inputSchema: {
        requestId: z.string(),
        waitSeconds: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe('Block up to this many seconds waiting for the request to resolve'),
      },
    },
    async args => {
      try {
        if (args.waitSeconds)
          await context.requests.waitForTerminal(args.requestId, args.waitSeconds * 1000);
        return jsonToolResult(requestView(context, args.requestId));
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'cancel_request',
    {
      title: 'Cancel a pending request',
      description:
        'Cancels a non-terminal connect or propose request so a new one can be created. Cannot cancel a request the user already resolved.',
      inputSchema: {
        requestId: z.string(),
      },
    },
    args => {
      try {
        context.requests.cancel(args.requestId);
        return jsonToolResult(requestView(context, args.requestId));
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );
}
