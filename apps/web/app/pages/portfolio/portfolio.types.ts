import type { BtcAsset, CryptoAssetBalance, Money, Sip10Asset, StxAsset } from '@leather.io/models';

export interface PortfolioAsset {
  asset: BtcAsset | Sip10Asset | StxAsset;
  crypto: CryptoAssetBalance;
  quote: CryptoAssetBalance;
}

export interface PortfolioTableRow extends PortfolioAsset {
  allocation: number;
  price?: Money;
  priceIsLoading?: boolean;
  priceChange?: number;
  priceChangeIsLoading?: boolean;
}

export type PortfolioAssetWithAllocation = PortfolioAsset & { allocation: number };
