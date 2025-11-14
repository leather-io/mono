import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';

export interface ZestBorrowMarketPosition extends BaseYieldPosition {
  provider: 'zest';
  product: 'zest-borrow-market';
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
