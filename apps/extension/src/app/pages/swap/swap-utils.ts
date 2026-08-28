import BigNumber from 'bignumber.js';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { parseTokenDetailsAssetId } from '@leather.io/features';
import { Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';
import {
  createMoneyFromDecimal,
  deserializeAssetId,
  getAssetId,
  isError,
  matchesAssetId,
  serializeAssetId,
  sumMoney,
} from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';

const signingCancelledMessages = ['User cancelled the signing operation'];

export function isSigningCancelledError(error: unknown) {
  return isError(error) && signingCancelledMessages.includes(error.message);
}

export function matchNativeAssetBySymbol(
  symbol: string | undefined
): SwappableFungibleCryptoAsset | undefined {
  if (!symbol) return undefined;
  if (symbol.toUpperCase() === stxAsset.symbol) return stxAsset;
  if (symbol.toUpperCase() === btcAsset.symbol) return btcAsset;
  return undefined;
}

function findSwapAssetBySymbol(
  assets: AccountSwapAsset[],
  symbol: string
): AccountSwapAsset | undefined {
  const matches = assets.filter(
    swapAsset => swapAsset.asset.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function findSwapAssetByRouteParam(
  assets: AccountSwapAsset[],
  param: string
): AccountSwapAsset | undefined {
  const serializedAssetId = parseTokenDetailsAssetId(param);
  if (serializedAssetId) {
    const assetId = deserializeAssetId(serializedAssetId);
    return assets.find(swapAsset => matchesAssetId(swapAsset.asset, assetId));
  }
  return findSwapAssetBySymbol(assets, param);
}

export function toSwapRouteParam(asset: SwappableFungibleCryptoAsset): string {
  if (asset.protocol === 'sip10') return serializeAssetId(getAssetId(asset));
  return asset.symbol;
}

export function getSwapRouteChain(asset: SwappableFungibleCryptoAsset): 'bitcoin' | 'stacks' {
  return asset.chain === 'bitcoin' ? 'bitcoin' : 'stacks';
}

export function getFungibleAssetDisplayName(asset: SwappableFungibleCryptoAsset): string {
  if (asset.symbol === 'STX') return 'Stacks';
  if (asset.symbol === 'BTC') return 'Bitcoin';
  return asset.name;
}

interface FormatSwapRateParams {
  swapRate: BigNumber;
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
}

export function formatSwapRate({ swapRate, baseAsset, targetAsset }: FormatSwapRateParams) {
  return `1 ${baseAsset.symbol} ≈ ${formatCurrency(createMoneyFromDecimal(swapRate, targetAsset.symbol, targetAsset.decimals))}`;
}

export function sumFeesInQuoteCurrency(networkFee: Money, providerFee?: Money): Money {
  return providerFee ? sumMoney([providerFee, networkFee]) : networkFee;
}

export function focusAmountField(input: HTMLInputElement | null) {
  if (!input) return;
  input.focus();
  const length = input.value.length;
  input.setSelectionRange(length, length);
}
