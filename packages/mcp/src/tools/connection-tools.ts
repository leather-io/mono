import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';

import { serverVersion } from '../config';
import { type ToolContext, errorToolResult, jsonToolResult } from './tool-helpers';

function generatePairingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(6))
    .map(byte => alphabet[byte % alphabet.length])
    .join('');
}

function pairedAccountSummary(context: ToolContext) {
  const pairing = context.pairing.load();
  if (!pairing) return undefined;
  return {
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
        'Reports whether a Leather wallet account is paired with this MCP server, and if so which addresses it exposes. Read-only, no wallet interaction.',
      inputSchema: {},
    },
    () => {
      try {
        const account = pairedAccountSummary(context);
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
    ({ force }) => {
      try {
        const existing = pairedAccountSummary(context);
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
            'Show the user the pairing code and have them open connectUrl in the browser where Leather is installed. They should check the code matches before approving. Poll check_request for the outcome.',
        });
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );
}
