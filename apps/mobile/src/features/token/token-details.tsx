import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { SummaryTableItem, SummaryTableRoot } from './summary-table';

interface TokenDetailsProps {
  name: string;
  ticker: string;
  network: string;
  price: string;
  priceChange: string;
}

export function TokenDetails({ name, ticker, network, price, priceChange }: TokenDetailsProps) {
  const { i18n } = useLingui();
  return (
    <SummaryTableRoot title={t({ id: 'token.details.title', message: 'Token Details' })}>
      <SummaryTableItem
        label={i18n._({
          id: 'token.details.price',
          message: '{ticker} Price',
          values: { ticker },
        })}
        value={price}
      />
      <SummaryTableItem
        label={t({ id: 'token.details.price_change', message: '24 Hour Change' })}
        value={priceChange}
      />
      <SummaryTableItem
        label={t({ id: 'token.details.token_name', message: 'Token name' })}
        value={name}
      />
      <SummaryTableItem
        label={t({ id: 'token.details.token_network', message: 'Token network' })}
        value={network}
      />
    </SummaryTableRoot>
  );
}
