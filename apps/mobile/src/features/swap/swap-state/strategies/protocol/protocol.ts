import { BITCOIN_MINIMUM_SPEND_IN_SATS } from '@leather.io/constants';
import { CryptoAssetBalance, Money } from '@leather.io/models';

export type SupportedProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export interface ProtocolStrategy {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null;
  getMinimumSpendAmount(): number;
  getMaximumSpendAmount(): number;
}

const nativeBtcStrategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return balance.availableBalance;
  },
  getMinimumSpendAmount(): number {
    return BITCOIN_MINIMUM_SPEND_IN_SATS;
  },
  getMaximumSpendAmount(): number {
    return Number.POSITIVE_INFINITY;
  },
};

const nativeStxStrategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return 'availableUnlockedBalance' in balance ? balance.availableUnlockedBalance : null;
  },
  getMinimumSpendAmount(): number {
    return 0;
  },
  getMaximumSpendAmount(): number {
    return Number.POSITIVE_INFINITY;
  },
};

const sip10Strategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return balance.availableBalance;
  },
  getMinimumSpendAmount(): number {
    return 0;
  },
  getMaximumSpendAmount(): number {
    return Number.POSITIVE_INFINITY;
  },
};

const strategyByProtocol: Record<SupportedProtocol, ProtocolStrategy> = {
  nativeBtc: nativeBtcStrategy,
  nativeStx: nativeStxStrategy,
  sip10: sip10Strategy,
};

export function getProtocolStrategy(protocol: SupportedProtocol): ProtocolStrategy {
  return strategyByProtocol[protocol];
}
