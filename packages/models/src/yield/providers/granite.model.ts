import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';
import type { YieldProductKeys } from '../yield-product.model';
import type { YieldProviderKeys } from '../yield-provider.model';

export interface GraniteV1Position extends BaseYieldPosition {
  provider: typeof YieldProviderKeys.granite;
  product: typeof YieldProductKeys.graniteV1;
  collateralBalance: Money;
  aeusdcMarket: {
    asset: FungibleCryptoAsset;
    earnApy: number;
    borrowApy: number;
  };
  earn?: {
    balance: Money;
    balanceQuote: Money;
  };
  borrow?: {
    balance: Money;
    balanceQuote: Money;
  };
  collateral: GraniteV1CollateralAsset[];
}

export interface GraniteV1CollateralAsset {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
}
