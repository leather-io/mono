import { CustomFeeConfig, FeeMode } from '@/features/swap/swap-state/swap-state.types';
import { STX_SAFETY_BUFFER } from '@/features/swap/swap-state/swap.constants';

import { BITCOIN_MINIMUM_SPEND_IN_SATS } from '@leather.io/constants';
import { CryptoAssetBalance, Money } from '@leather.io/models';
import { subtractMoney } from '@leather.io/utils';

export type SupportedProtocol = 'nativeBtc' | 'nativeStx' | 'sip10';

export interface ProtocolStrategy {
  resolveSpendableAmount(balance: CryptoAssetBalance): Money;
  getMinimumSpendAmount(): number;
  getMaximumSpendAmount(): number;
  getFeeCapabilities(): FeeCapabilities;
}

export interface FeeCapabilities {
  mode: FeeMode;
  customConfig: CustomFeeConfig;
}

const nativeBtcStrategy: ProtocolStrategy = {
  resolveSpendableAmount(balance: CryptoAssetBalance): Money {
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
  resolveSpendableAmount(balance: CryptoAssetBalance): Money {
    return subtractMoney(balance.availableBalance, STX_SAFETY_BUFFER);
    // return createMoney(balance.availableBalance.amount.minus(STX_SAFETY_BUFFER.amount), 'STX');
    // return balance.availableBalance;
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
  resolveSpendableAmount(balance: CryptoAssetBalance): Money {
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
