import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import type { BoxProps } from 'leather-styles/jsx';

import type { SpendSourcesSummary } from '@leather.io/bitcoin';
import { Callout } from '@leather.io/ui';

interface SpendSourcesTaprootCalloutProps extends BoxProps {
  summary: SpendSourcesSummary;
}

export function SpendSourcesTaprootCallout({ summary, ...props }: SpendSourcesTaprootCalloutProps) {
  if (!summary.taproot.amount.isGreaterThan(0)) return null;

  return (
    <Callout
      data-testid={SendCryptoAssetSelectors.SpendSourcesTaprootCallout}
      variant="warning"
      title="Some coins come from a Taproot address"
      {...props}
    >
      This BTC may carry inscriptions or runes. Spending it sends them along. To keep these coins
      untouched, cancel this transaction.
    </Callout>
  );
}
