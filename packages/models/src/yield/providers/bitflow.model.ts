import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';
import type { YieldProductKeys } from '../yield-product.model';
import type { YieldProviderKeys } from '../yield-provider.model';

export interface BitflowAmmLpPosition extends BaseYieldPosition {
  provider: typeof YieldProviderKeys.bitflow;
  product: typeof YieldProductKeys.bitflowAmmLp;
  pools: BitflowAmmLpPool[];
}

export interface BitflowAmmLpPool {
  apy: number;
  poolSharePercentage: number;
  lpToken: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  tokenX: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
  tokenY: {
    asset: FungibleCryptoAsset;
    balance: Money;
    balanceQuote: Money;
  };
}
