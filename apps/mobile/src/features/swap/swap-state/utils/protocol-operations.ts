import {
  SupportedProtocol,
  getProtocolStrategy,
} from '@/features/swap/swap-state/strategies/protocol/protocol';
import { InputCurrencyMode } from '@/utils/types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { CryptoAssetBalance, Money } from '@leather.io/models';

export function resolveSpendableBalanceInCurrencyMode(
  balance: { crypto: CryptoAssetBalance; quote: CryptoAssetBalance } | undefined,
  protocol: SupportedProtocol | undefined,
  inputCurrencyMode: InputCurrencyMode
): Money | null {
  if (!balance || !protocol) return null;

  const { resolveSpendableBalance: resolve } = getProtocolStrategy(protocol);
  const selectedBalance = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: balance.crypto,
    quote: balance.quote,
  });

  return resolve(selectedBalance);
}

export function resolveMinimumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return 0;
  return getProtocolStrategy(protocol).getMinimumSpendAmount();
}

export function resolveMaximumSpendAmount(protocol: SupportedProtocol | undefined): number {
  if (!protocol) return Number.POSITIVE_INFINITY;
  return getProtocolStrategy(protocol).getMaximumSpendAmount();
}
