#!/usr/bin/env node
import 'reflect-metadata';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { loadConfig, serverVersion } from './config';
import { initMcpServices } from './container';
import { startHttpListener } from './http-listener';
import { PairingStore, mapAddressesResultToPairing } from './pairing';
import { PendingRequestStore } from './pending-requests';
import { QuoteCache } from './quote-cache';
import { registerTools } from './tools/register-tools';
import type { ToolContext } from './tools/tool-helpers';

async function main() {
  const config = loadConfig();
  initMcpServices();

  const context: ToolContext = {
    config,
    pairing: new PairingStore(config.pairingFilePath),
    requests: new PendingRequestStore(config.requestTtlMs),
    quotes: new QuoteCache(config.quoteTtlMs),
  };

  await startHttpListener({
    config,
    requests: context.requests,
    onConnectApproved(payload) {
      context.pairing.save(mapAddressesResultToPairing(payload));
    },
  });

  const server = new McpServer({ name: 'leather', version: serverVersion });
  registerTools(server, context);
  await server.connect(new StdioServerTransport());
  process.stderr.write(
    `leather-mcp v${serverVersion} ready, approval pages at ${config.baseUrl}\n`
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
