import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';
import type { YieldProductKeys } from '../yield-product.model';
import type { YieldProviderKeys } from '../yield-provider.model';

export interface ZestBorrowPosition extends BaseYieldPosition {
  provider: typeof YieldProviderKeys.zest;
  product: typeof YieldProductKeys.zestBorrow;
  supplyBalance: Money;
  borrowBalance: Money;
  ltvPercentage: number;
  borrowAssets: ZestBorrowAsset[];
  supplyAssets: ZestBorrowAsset[];
}

export interface ZestBorrowAsset {
  asset: FungibleCryptoAsset;
  apy: number;
  balance: Money;
  balanceQuote: Money;
}
