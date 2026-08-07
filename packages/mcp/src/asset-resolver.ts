import { btcAsset, stxAsset } from '@leather.io/constants';
import type { FungibleCryptoAsset, SwapAsset } from '@leather.io/models';
import { getSip10AssetService, getSwapService } from '@leather.io/services';
import { getAssetId } from '@leather.io/utils';

import { McpToolError } from './errors';

export async function resolveFungibleAsset(
  input: string,
  signal?: AbortSignal
): Promise<FungibleCryptoAsset> {
  const normalized = input.trim();
  if (normalized.toUpperCase() === 'BTC') return btcAsset;
  if (normalized.toUpperCase() === 'STX') return stxAsset;
  if (normalized.includes('.')) {
    try {
      if (normalized.includes('::'))
        return await getSip10AssetService().getAsset(normalized, signal);
      return await getSip10AssetService().getAssetByPrincipal(normalized, signal);
    } catch {
      throw new McpToolError('UNSUPPORTED_ASSET', `No SIP-10 token found for "${normalized}".`);
    }
  }
  throw new McpToolError(
    'UNSUPPORTED_ASSET',
    `Unrecognized asset "${normalized}". Use "BTC", "STX", or a SIP-10 contract id like "SP123....token-contract".`
  );
}

function matchesSwapAsset(swapAsset: SwapAsset, input: string): boolean {
  const asset = swapAsset.asset;
  const normalized = input.trim();
  if (asset.symbol.toLowerCase() === normalized.toLowerCase()) return true;
  return (
    asset.protocol === 'sip10' && (asset.contractId === normalized || asset.assetId === normalized)
  );
}

export async function resolveSwapPair(from: string, to: string, signal?: AbortSignal) {
  const swapService = getSwapService();
  const baseAssets = await swapService.getBaseSwapAssets(signal);
  const base = baseAssets.find(swapAsset => matchesSwapAsset(swapAsset, from));
  if (!base)
    throw new McpToolError(
      'UNSUPPORTED_ASSET',
      `No swappable asset matches "${from}". Symbols (e.g. "STX") and SIP-10 contract ids are accepted.`
    );
  const targetAssets = await swapService.getTargetSwapAssets(getAssetId(base.asset), signal);
  const target = targetAssets.find(swapAsset => matchesSwapAsset(swapAsset, to));
  if (!target)
    throw new McpToolError(
      'UNSUPPORTED_ASSET',
      `No swap route from "${from}" to "${to}" is available.`
    );
  return { base, target };
}
