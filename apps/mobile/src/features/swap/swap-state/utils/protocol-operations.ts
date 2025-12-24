import {
  SupportedProtocol,
  getProtocolStrategy,
} from '@/features/swap/swap-state/strategies/protocol/protocol';

export function resolveMinimumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return 0;
  return getProtocolStrategy(protocol).getMinimumSpendAmount();
}

export function resolveMaximumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return Number.POSITIVE_INFINITY;
  return getProtocolStrategy(protocol).getMaximumSpendAmount();
}
