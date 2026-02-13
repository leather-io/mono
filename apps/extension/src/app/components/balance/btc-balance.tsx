import { Caption } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { PrivateText } from '@app/components/privacy/private-text';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';

export function BtcBalance() {
  const balance = useCurrentBtcBalanceWithFallback();

  return (
    <Caption>
      <PrivateText canClickToShow>{formatCurrency(balance.btc.availableBalance)}</PrivateText>
    </Caption>
  );
}
