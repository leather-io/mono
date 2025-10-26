import { CustomFeeConfig, FeeMode } from '@/features/swap/swap-state/swap-state.types';

import { BITCOIN_MINIMUM_SPEND_IN_SATS } from '@leather.io/constants';
import { CryptoAssetBalance, Money } from '@leather.io/models';

export type SupportedProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export interface ProtocolStrategy {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null;
  getMinimumSpendAmount(): number;
  getMaximumSpendAmount(): number;
  getFeeCapabilities(): FeeCapabilities;
}

export interface FeeCapabilities {
  mode: FeeMode;
  customConfig: CustomFeeConfig;
}

const nativeBtcStrategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return balance.availableBalance;
  },
  getMinimumSpendAmount() {
    return BITCOIN_MINIMUM_SPEND_IN_SATS;
  },
  getMaximumSpendAmount() {
    return Number.POSITIVE_INFINITY;
  },
  getFeeCapabilities() {
    return {
      mode: 'tiered',
      customConfig: {
        // TODO: Revise
        enabled: true,
        constraints: {
          networkMin: 0,
          networkMax: 5000,
          recommendedMin: 0,
          recommendedMax: 5000,
        },
      },
    };
  },
};

const nativeStxStrategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return 'availableUnlockedBalance' in balance ? balance.availableUnlockedBalance : null;
  },
  getMinimumSpendAmount() {
    return 0;
  },
  getMaximumSpendAmount() {
    return Number.POSITIVE_INFINITY;
  },
  getFeeCapabilities() {
    return {
      mode: 'tiered',
      customConfig: {
        // TODO: Revise
        enabled: true,
        constraints: {
          networkMin: 0,
          networkMax: 5000,
          recommendedMin: 0,
          recommendedMax: 5000,
        },
      },
    };
  },
};

const sip10Strategy: ProtocolStrategy = {
  resolveSpendableBalance(balance: CryptoAssetBalance): Money | null {
    return balance.availableBalance;
  },
  getMinimumSpendAmount() {
    return 0;
  },
  getMaximumSpendAmount() {
    return Number.POSITIVE_INFINITY;
  },
  getFeeCapabilities() {
    // TODO: Temporary
    return {
      mode: 'fixed',
      customConfig: { enabled: false },
    };
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
