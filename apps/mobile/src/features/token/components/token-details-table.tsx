import { ReactNode } from 'react';

import { t } from '@lingui/macro';

import { SummaryTableItem, SummaryTableRoot } from '../summary-table';
import { TokenDetailsCard } from './token-details-card';

interface TokenDetailsTableProps {
  name: string;
  layer: string;
  price: ReactNode;
  priceChange: ReactNode;
}

export function TokenDetailsTable({ name, layer, price, priceChange }: TokenDetailsTableProps) {
  return (
    <TokenDetailsCard title={t({ id: 'token.details.title', message: 'Token Details' })}>
      <SummaryTableRoot>
        <SummaryTableItem label={t({ id: 'token.details.name', message: 'Name' })} value={name} />
        <SummaryTableItem
          label={t({ id: 'token.details.price', message: 'Price' })}
          value={price}
        />
        <SummaryTableItem
          label={t({ id: 'token.details.price_change', message: '24 Hour Change' })}
          value={priceChange}
        />
        <SummaryTableItem
          label={t({ id: 'token.details.layer', message: 'Layer' })}
          value={layer}
        />
      </SummaryTableRoot>
    </TokenDetailsCard>
  );
}
