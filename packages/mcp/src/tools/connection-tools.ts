import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';

import { getBnsService } from '@leather.io/services';

import { serverVersion } from '../config';
import { type ToolContext, errorToolResult, jsonToolResult } from './tool-helpers';

function generatePairingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(6))
    .map(byte => alphabet[byte % alphabet.length])
    .join('');
}

async function resolveAccountBnsName(
  context: ToolContext,
  signal?: AbortSignal
): Promise<string | undefined> {
  const pairing = context.pairing.load();
  if (!pairing) return undefined;
  const names = await getBnsService().getAccountBnsNames({ account: pairing.account }, signal);
  return (names.find(name => name.isPrimary) ?? names[0])?.fullName;
}

async function pairedAccountSummary(context: ToolContext, signal?: AbortSignal) {
  const pairing = context.pairing.load();
  if (!pairing) return undefined;
  const bnsName = await resolveAccountBnsName(context, signal);
  return {
    bnsName,
    fingerprint: pairing.account.id.fingerprint,
    accountIndex: pairing.account.id.accountIndex,
    stxAddress: pairing.account.stacks?.stxAddress,
    btcNativeSegwitAddress: pairing.account.bitcoin?.zeroIndexNativeSegwitPayerAddress,
    btcTaprootAddress: pairing.account.bitcoin?.zeroIndexTaprootPayerAddress,
    pairedAt: pairing.pairedAt,
  };
}

export function registerConnectionTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'get_wallet_status',
    {
      title: 'Get wallet status',
      description:
        'Reports whether a Leather wallet account is paired with this MCP server, and if so which addresses it exposes, plus its BNS name when it has one. Read-only, no wallet interaction.',
      inputSchema: {},
    },
    async (_args, extra) => {
      try {
        const account = await pairedAccountSummary(context, extra.signal);
        return jsonToolResult({
          paired: account !== undefined,
          network: 'mainnet',
          serverVersion,
          account,
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'connect_wallet',
    {
      title: 'Connect Leather wallet',
      description:
        "Starts pairing with the user's Leather browser extension. Returns a URL the user must open plus a pairing code to show them; the wallet asks for their approval. One account is paired at a time.",
      inputSchema: {
        force: z.boolean().optional().describe('Re-pair even if an account is already connected'),
      },
    },
    async ({ force }, extra) => {
      try {
        const existing = await pairedAccountSummary(context, extra.signal);
        if (existing && !force)
          return jsonToolResult({
            alreadyPaired: true,
            account: existing,
            hint: 'A wallet is already connected. Pass force: true to replace the pairing.',
          });
        const pairingCode = generatePairingCode();
        const request = context.requests.create({
          kind: 'connect',
          summary: 'Connect Leather wallet to this agent',
          rpcMethod: 'getAddresses',
          rpcParams: {},
          pairingCode,
        });
        return jsonToolResult({
          requestId: request.id,
          connectUrl: `${context.config.baseUrl}/connect/${request.id}`,
          pairingCode,
          expiresAt: new Date(request.expiresAt).toISOString(),
          instructions:
            'Show the user the pairing code and have them open connectUrl in the browser where Leather is installed. They should check the code matches before approving. Then call check_request with waitSeconds: 50 and repeat while still pending — it returns the moment they approve. Do not ask the user to report back.',
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'disconnect_wallet',
    {
      title: 'Disconnect Leather wallet',
      description:
        'Removes the pairing between this server and the Leather wallet and cancels any in-flight request. Purely local and instant — no wallet interaction. The Leather extension keeps its own permission for this server until the user removes it in Leather under Settings → Connected apps.',
      inputSchema: {},
    },
    async (_args, extra) => {
      try {
        if (!context.pairing.load())
          return jsonToolResult({
            paired: false,
            hint: 'No wallet is paired, so there is nothing to disconnect.',
          });
        const account = await pairedAccountSummary(context, extra.signal).catch(() => undefined);
        const cancelledRequestIds = context.requests.cancelNonTerminal().map(request => request.id);
        context.pairing.clear();
        return jsonToolResult({
          disconnected: true,
          account,
          cancelledRequestIds,
          instructions:
            'Tell the user the wallet is disconnected: this server no longer has access to its addresses, balances, or activity. Also tell them Leather itself still lists this server as a connected app until they remove it in the extension under Settings → Connected apps.',
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );
}
