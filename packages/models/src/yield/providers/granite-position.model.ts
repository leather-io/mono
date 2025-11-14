import type { FungibleCryptoAsset } from '../../assets/asset.model';
import type { Money } from '../../money.model';
import type { BaseYieldPosition } from '../yield-position.base.model';

export interface GraniteV1EarnPosition extends BaseYieldPosition {
  provider: 'granite';
  product: 'granite-v1-earn';
  marketAsset: FungibleCryptoAsset;
  marketAssetSupplyBalance: Money;
  marketAssetSupplyBalanceQuote: Money;
}

export interface GraniteV1BorrowPosition extends BaseYieldPosition {
  provider: 'granite';
  product: 'granite-v1-borrow';
  marketAsset: FungibleCryptoAsset;
  marketAssetBorrowBalance: Money;
  marketAssetBorrowBalanceQuote: Money;
  collateralBalanceQuote: Money;
  collateral: GraniteV1CollateralAsset[];
}

export interface GraniteV1CollateralAsset {
  asset: FungibleCryptoAsset;
  balance: Money;
  balanceQuote: Money;
}
