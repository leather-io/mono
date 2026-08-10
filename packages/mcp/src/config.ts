import os from 'node:os';
import path from 'node:path';

const defaultPort = 8437;
const requestTtlMs = 10 * 60 * 1000;
const quoteTtlMs = 5 * 60 * 1000;

export const serverVersion = '0.1.0';

export interface McpConfig {
  host: string;
  port: number;
  baseUrl: string;
  pairingFilePath: string;
  requestTtlMs: number;
  quoteTtlMs: number;
}

export function loadConfig(): McpConfig {
  const host = '127.0.0.1';
  const portOverride = Number(process.env.LEATHER_MCP_PORT);
  const port = Number.isInteger(portOverride) && portOverride > 0 ? portOverride : defaultPort;
  return {
    host,
    port,
    baseUrl: `http://${host}:${port}`,
    pairingFilePath: path.join(os.homedir(), '.leather-mcp', 'pairing.json'),
    requestTtlMs,
    quoteTtlMs,
  };
}
