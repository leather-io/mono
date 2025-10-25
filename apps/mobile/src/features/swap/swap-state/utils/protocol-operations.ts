import {
  SupportedProtocol,
  getProtocolStrategy,
} from '@/features/swap/swap-state/strategies/protocol/protocol';

import { CryptoAssetBalance } from '@leather.io/models';

export function resolveSpendableBalance(
  balance: { crypto: CryptoAssetBalance; quote: CryptoAssetBalance } | undefined,
  protocol: SupportedProtocol | undefined
) {
  if (!balance || !protocol) return null;

  const { resolveSpendableAmount } = getProtocolStrategy(protocol);
  return resolveSpendableAmount(balance.crypto);
}

export function resolveMinimumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return 0;
  return getProtocolStrategy(protocol).getMinimumSpendAmount();
}

export function resolveMaximumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return Number.POSITIVE_INFINITY;
  return getProtocolStrategy(protocol).getMaximumSpendAmount();
}
