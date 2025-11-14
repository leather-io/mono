import type {
  BitflowAmmLpPosition,
  BitflowAmmStakingPosition,
} from '../providers/bitflow-position.model';
import type {
  GraniteV1BorrowPosition,
  GraniteV1EarnPosition,
} from '../providers/granite-position.model';
import type {
  StackingDaoPooledStackingPosition,
  StackingDaoStStxBtcPosition,
  StackingDaoStStxPosition,
} from '../providers/stacking-dao-position.model';
import type { ZestBorrowMarketPosition } from '../providers/zest-position.model';
import type { YieldPosition } from '../yield-position.model';
import {
  YieldProduct,
  YieldProductCategories,
  YieldProductCategory,
  YieldProductKey,
  YieldProductKeys,
  YieldProductToProviderMap,
} from '../yield-product.model';
import { YieldProvider, YieldProviderKey } from '../yield-provider.model';

export function isBitflowAmmLpPosition(pos: YieldPosition): pos is BitflowAmmLpPosition {
  return pos.product === YieldProductKeys.bitflowAmmLp;
}

export function isBitflowAmmStakingPosition(pos: YieldPosition): pos is BitflowAmmStakingPosition {
  return pos.product === YieldProductKeys.bitflowAmmStaking;
}

export function isZestPosition(pos: YieldPosition): pos is ZestBorrowMarketPosition {
  return pos.product === YieldProductKeys.zestBorrowMarket;
}

export function isGraniteEarnPosition(pos: YieldPosition): pos is GraniteV1EarnPosition {
  return pos.product === YieldProductKeys.graniteV1Earn;
}

export function isGraniteBorrowPosition(pos: YieldPosition): pos is GraniteV1BorrowPosition {
  return pos.product === YieldProductKeys.graniteV1Borrow;
}

export function isStackingDaoStStxPosition(pos: YieldPosition): pos is StackingDaoStStxPosition {
  return pos.product === YieldProductKeys.stackingDaoStstx;
}

export function isStackingDaoStStxBtcPosition(
  pos: YieldPosition
): pos is StackingDaoStStxBtcPosition {
  return pos.product === YieldProductKeys.stackingDaoStstxbtc;
}

export function isStackingDaoPooledPosition(
  pos: YieldPosition
): pos is StackingDaoPooledStackingPosition {
  return pos.product === YieldProductKeys.stackingDaoPooledStacking;
}

export function filterPositionsByProvider(
  positions: YieldPosition[],
  provider: YieldProviderKey
): YieldPosition[] {
  return positions.filter(p => p.provider === provider);
}

export function filterPositionsByProduct(
  positions: YieldPosition[],
  product: YieldProductKey
): YieldPosition[] {
  return positions.filter(p => p.product === product);
}

export function filterPositionsByCategory(
  positions: YieldPosition[],
  products: YieldProduct[],
  category: YieldProductCategory
): YieldPosition[] {
  const productMap = new Map(products.map(p => [p.key, p]));
  return positions.filter(pos => productMap.get(pos.product)?.category === category);
}

export function sortPositionsByBalance(
  positions: YieldPosition[],
  ascending = false
): YieldPosition[] {
  return [...positions].sort((a, b) => {
    const diff = a.totalBalance.amount.comparedTo(b.totalBalance.amount);
    return ascending ? diff : -diff;
  });
}

export function sortPositionsByApy(positions: YieldPosition[], ascending = false): YieldPosition[] {
  return [...positions].sort((a, b) => {
    const apyA = a.apy;
    const apyB = b.apy;
    return ascending ? apyA - apyB : apyB - apyA;
  });
}

export function sortPositionsByUpdateTime(
  positions: YieldPosition[],
  ascending = false
): YieldPosition[] {
  return [...positions].sort((a, b) => {
    const timeA = 'updatedAt' in a && a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
    const timeB = 'updatedAt' in b && b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

export function getProviderForProduct(product: YieldProductKey): YieldProviderKey {
  return YieldProductToProviderMap[product];
}

export function getCategoryForProduct(product: YieldProduct): YieldProductCategory {
  return product.category;
}

export function isProductInProvider(product: YieldProductKey, provider: YieldProviderKey): boolean {
  return YieldProductToProviderMap[product] === provider;
}

export function getProductsForProvider(provider: YieldProviderKey): YieldProductKey[] {
  return Object.entries(YieldProductToProviderMap)
    .filter(([_, p]) => p === provider)
    .map(([product]) => product as YieldProductKey);
}

export function getProductsInCategory(
  products: YieldProduct[],
  category: YieldProductCategory
): YieldProduct[] {
  return products.filter(p => p.category === category);
}

export function groupPositionsByProvider(
  positions: YieldPosition[]
): Record<YieldProviderKey, YieldPosition[]> {
  const grouped: Partial<Record<YieldProviderKey, YieldPosition[]>> = {};

  for (const position of positions) {
    const provider = position.provider;
    if (!grouped[provider]) {
      grouped[provider] = [];
    }
    grouped[provider].push(position);
  }

  return grouped as Record<YieldProviderKey, YieldPosition[]>;
}

export function groupPositionsByCategory(
  positions: YieldPosition[],
  products: YieldProduct[]
): Record<string, YieldPosition[]> {
  const grouped: Record<string, YieldPosition[]> = {};
  const productMap = new Map(products.map(p => [p.key, p]));

  for (const position of positions) {
    const product = productMap.get(position.product);
    if (!product) continue;

    const category = product.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(position);
  }

  return grouped;
}

export function getPositionsInCategories(
  positions: YieldPosition[],
  products: YieldProduct[],
  categories: YieldProductCategory[]
): YieldPosition[] {
  const categorySet = new Set(categories);
  const productMap = new Map(products.map(p => [p.key, p]));
  return positions.filter(pos => {
    const product = productMap.get(pos.product);
    return product && categorySet.has(product.category);
  });
}

export function hasPositionsInProvider(
  positions: YieldPosition[],
  provider: YieldProviderKey
): boolean {
  return positions.some(p => p.provider === provider);
}

export function hasPositionsInCategory(
  positions: YieldPosition[],
  products: YieldProduct[],
  category: YieldProductCategory
): boolean {
  const productMap = new Map(products.map(p => [p.key, p]));
  return positions.some(pos => productMap.get(pos.product)?.category === category);
}

export function enrichPositionWithProvider<T extends YieldPosition>(
  position: T,
  provider: YieldProvider
): T & { providerData: YieldProvider } {
  return { ...position, providerData: provider };
}

export function enrichPositionWithProduct<T extends YieldPosition>(
  position: T,
  product: YieldProduct
): T & { productData: YieldProduct } {
  return { ...position, productData: product };
}

export function enrichPositionWithMetadata<T extends YieldPosition>(
  position: T,
  provider: YieldProvider,
  product: YieldProduct
): T & { providerData: YieldProvider; productData: YieldProduct } {
  return { ...position, providerData: provider, productData: product };
}

export function getCategoryDisplayName(category: YieldProductCategory): string {
  const displayNames: Record<YieldProductCategory, string> = {
    [YieldProductCategories.AMM]: 'Liquidity Pools',
    [YieldProductCategories.LENDING]: 'Lending & Borrowing',
    [YieldProductCategories.LIQUID_STACKING]: 'Liquid Stacking',
    [YieldProductCategories.POOLED_STACKING]: 'Pooled Stacking',
    [YieldProductCategories.STAKING]: 'Staking',
    [YieldProductCategories.PERPS]: 'Perpetuals',
  };
  return displayNames[category] || category;
}
