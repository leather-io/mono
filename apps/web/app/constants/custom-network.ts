import { z } from 'zod';

// Custom "private" network config for internal testing. Bridged from Edgar's
// unprefixed docker env vars into import.meta.env.LEATHER_* by vite.config.ts.
// Kept separate from environment.ts so the signing/settings paths can import it
// without pulling in environment.ts's MODE parse.
const privateNetworkFlavor = z
  .enum(['regtest', 'testnet'])
  .optional()
  .parse(import.meta.env.LEATHER_PRIVATE_NETWORK_FLAVOR);
const privateNetworkName = z
  .string()
  .optional()
  .parse(import.meta.env.LEATHER_PRIVATE_NETWORK_NAME);
const privateNetworkKey = z
  .string()
  .optional()
  .parse(import.meta.env.LEATHER_PRIVATE_NETWORK_KEY);
const privateBitcoinApiUrl = z
  .url()
  .optional()
  .parse(import.meta.env.LEATHER_BITCOIN_API_URL);
const privateStacksApiUrl = z
  .url()
  .optional()
  .parse(import.meta.env.LEATHER_STACKS_API_URL);
const privateStacksChainId = z.coerce
  .number()
  .optional()
  .parse(import.meta.env.LEATHER_STACKS_CHAIN_ID);

export interface CustomNetworkConfig {
  flavor: 'regtest' | 'testnet';
  name: string;
  key: string;
  bitcoinApiUrl: string;
  stacksApiUrl: string;
  stacksChainId: number | undefined;
}

function resolveCustomNetwork(): CustomNetworkConfig | null {
  if (!privateNetworkFlavor || !privateBitcoinApiUrl || !privateStacksApiUrl) return null;
  return {
    flavor: privateNetworkFlavor,
    name: privateNetworkName ?? 'Private',
    key: privateNetworkKey ?? 'private',
    bitcoinApiUrl: privateBitcoinApiUrl,
    stacksApiUrl: privateStacksApiUrl,
    stacksChainId: privateStacksChainId,
  };
}

export const customNetwork = resolveCustomNetwork();
