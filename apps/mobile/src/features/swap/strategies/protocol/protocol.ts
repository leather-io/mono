import { CryptoAssetBalance, Money } from '@leather.io/models';

export type SupportedProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export interface ProtocolStrategy {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null;
}

const nativeBtcStrategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return balance.availableBalance;
  },
};

const nativeStxStrategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return 'availableUnlockedBalance' in balance ? balance.availableUnlockedBalance : null;
  },
};

const sip10Strategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return balance.availableBalance;
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
