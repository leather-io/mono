import { BtcCryptoAssetBalance, Money } from '@leather.io/models';

export interface BtcCompositeBalance {
  availableBalance: Money;
  protectedBalance: Money;
  uneconomicalBalance: Money;
  subBalances: BtcSubBalance[];
}

export interface BtcSubBalance {
  descriptor: string;
  balance: BtcCryptoAssetBalance;
}
