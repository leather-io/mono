import { z } from 'zod';

// Custom network config for internal testing (null in production).
const bitcoinNetworkMode = z
  .enum(['regtest', 'testnet'])
  .optional()
  .parse(import.meta.env.LEATHER_PRIVATE_NETWORK_FLAVOR);
const customNetworkName = z
  .string()
  .optional()
  .parse(import.meta.env.LEATHER_PRIVATE_NETWORK_NAME);
const customNetworkKey = z
  .string()
  .optional()
  .parse(import.meta.env.LEATHER_PRIVATE_NETWORK_KEY);
const bitcoinApiUrl = z
  .url()
  .optional()
  .parse(import.meta.env.LEATHER_BITCOIN_API_URL);
const stacksApiUrl = z
  .url()
  .optional()
  .parse(import.meta.env.LEATHER_STACKS_API_URL);
const stacksChainId = z.coerce
  .number()
  .optional()
  .parse(import.meta.env.LEATHER_STACKS_CHAIN_ID);

export interface CustomNetworkConfig {
  bitcoinNetworkMode: 'regtest' | 'testnet';
  name: string;
  key: string;
  bitcoinApiUrl: string;
  stacksApiUrl: string;
  stacksChainId: number | undefined;
}

function resolveCustomNetworkConfig(): CustomNetworkConfig | null {
  if (!bitcoinNetworkMode || !bitcoinApiUrl || !stacksApiUrl) return null;
  return {
    bitcoinNetworkMode,
    name: customNetworkName ?? 'Private',
    key: customNetworkKey ?? 'private',
    bitcoinApiUrl,
    stacksApiUrl,
    stacksChainId,
  };
}

export const customNetworkConfig = resolveCustomNetworkConfig();
