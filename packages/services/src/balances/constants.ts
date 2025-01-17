import {
  createBtcCryptoAssetBalance,
  createMoney,
  createStxCryptoAssetBalance,
} from '@leather.io/utils';

export const btcCryptoAssetZeroBalanceBtc = createBtcCryptoAssetBalance(createMoney(0, 'BTC'));
export const btcCryptoAssetZeroBalanceUsd = createBtcCryptoAssetBalance(createMoney(0, 'USD'));
export const stxCryptoAssetZeroBalanceStx = createStxCryptoAssetBalance(createMoney(0, 'STX'));
export const stxCryptoAssetZeroBalanceUsd = createStxCryptoAssetBalance(createMoney(0, 'USD'));
export const baseCryptoAssetZeroBalanceUsd = createStxCryptoAssetBalance(createMoney(0, 'USD'));
