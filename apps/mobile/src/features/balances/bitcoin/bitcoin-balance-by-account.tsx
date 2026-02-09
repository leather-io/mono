import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';

import { AccountId } from '@leather.io/models';

import { BitcoinTokenBalance } from './bitcoin-token-balance';

interface BitcoinBalanceByAccountProps extends AccountId {
  onPress?(): void;
}

export function BitcoinBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: BitcoinBalanceByAccountProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;

  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}
