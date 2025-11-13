import type { BitflowAmmLpPosition } from '../providers/bitflow.model';
import type { GraniteV1Position } from '../providers/granite.model';
import type {
  StackingDaoLstPosition,
  StackingDaoPooledStackingPosition,
} from '../providers/stacking-dao.model';
import type { ZestBorrowPosition } from '../providers/zest.model';
import type { YieldPosition } from '../yield-position.model';
import {
  YieldProduct,
  YieldProductCategories,
  YieldProductCategory,
  YieldProductKey,
  YieldProductKeys,
  YieldProductToProtocolMap,
} from '../yield-product.model';
import { YieldProvider, YieldProviderKey } from '../yield-provider.model';

export function isBitflowPosition(pos: YieldPosition): pos is BitflowAmmLpPosition {
  return pos.product === YieldProductKeys.bitflowAmmLp;
}

export function isZestPosition(pos: YieldPosition): pos is ZestBorrowPosition {
  return pos.product === YieldProductKeys.zestBorrow;
}

export function isGranitePosition(pos: YieldPosition): pos is GraniteV1Position {
  return pos.product === YieldProductKeys.graniteV1;
}

export function isStackingDaoLstPosition(pos: YieldPosition): pos is StackingDaoLstPosition {
  return pos.product === YieldProductKeys.stackingDaoLst;
}

export function isStackingDaoPooledPosition(
  pos: YieldPosition
): pos is StackingDaoPooledStackingPosition {
  return pos.product === YieldProductKeys.stackingDaoPooledStacking;
}

export function filterPositionsByProtocol(
  positions: YieldPosition[],
  protocol: YieldProviderKey
): YieldPosition[] {
  return positions.filter(p => p.provider === protocol);
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
    const apyA = a.netApy ?? 0;
    const apyB = b.netApy ?? 0;
    return ascending ? apyA - apyB : apyB - apyA;
  });
}

export function sortPositionsByUpdateTime(
  positions: YieldPosition[],
  ascending = false
): YieldPosition[] {
  return [...positions].sort((a, b) => {
    const timeA = a.updatedAt?.getTime() ?? 0;
    const timeB = b.updatedAt?.getTime() ?? 0;
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

export function getProtocolForProduct(product: YieldProductKey): YieldProviderKey {
  return YieldProductToProtocolMap[product];
}

export function getCategoryForProduct(product: YieldProduct): YieldProductCategory {
  return product.category;
}

export function isProductInProtocol(product: YieldProductKey, protocol: YieldProviderKey): boolean {
  return YieldProductToProtocolMap[product] === protocol;
}

export function getProductsForProtocol(protocol: YieldProviderKey): YieldProductKey[] {
  return Object.entries(YieldProductToProtocolMap)
    .filter(([_, p]) => p === protocol)
    .map(([product]) => product as YieldProductKey);
}

export function getProductsInCategory(
  products: YieldProduct[],
  category: YieldProductCategory
): YieldProduct[] {
  return products.filter(p => p.category === category);
}

export function groupPositionsByProtocol(
  positions: YieldPosition[]
): Record<YieldProviderKey, YieldPosition[]> {
  const grouped: Partial<Record<YieldProviderKey, YieldPosition[]>> = {};

  for (const position of positions) {
    const protocol = position.provider;
    if (!grouped[protocol]) {
      grouped[protocol] = [];
    }
    grouped[protocol].push(position);
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

export function hasPositionsInProtocol(
  positions: YieldPosition[],
  protocol: YieldProviderKey
): boolean {
  return positions.some(p => p.provider === protocol);
}

export function hasPositionsInCategory(
  positions: YieldPosition[],
  products: YieldProduct[],
  category: YieldProductCategory
): boolean {
  const productMap = new Map(products.map(p => [p.key, p]));
  return positions.some(pos => productMap.get(pos.product)?.category === category);
}

export function enrichPositionWithProtocol<T extends YieldPosition>(
  position: T,
  protocol: YieldProvider
): T & { protocolData: YieldProvider } {
  return { ...position, protocolData: protocol };
}

export function enrichPositionWithProduct<T extends YieldPosition>(
  position: T,
  product: YieldProduct
): T & { productData: YieldProduct } {
  return { ...position, productData: product };
}

export function enrichPositionWithMetadata<T extends YieldPosition>(
  position: T,
  protocol: YieldProvider,
  product: YieldProduct
): T & { protocolData: YieldProvider; productData: YieldProduct } {
  return { ...position, protocolData: protocol, productData: product };
}

export function getCategoryDisplayName(category: YieldProductCategory): string {
  const displayNames: Record<YieldProductCategory, string> = {
    [YieldProductCategories.AMM]: 'Liquidity Pools',
    [YieldProductCategories.LENDING]: 'Lending & Borrowing',
    [YieldProductCategories.LST]: 'Liquid Stacking',
    [YieldProductCategories.CDP]: 'Collateralized Debt',
    [YieldProductCategories.POOLED_STACKING]: 'Stacking',
    [YieldProductCategories.PERPS]: 'Perpetuals',
  };
  return displayNames[category] || category;
}
