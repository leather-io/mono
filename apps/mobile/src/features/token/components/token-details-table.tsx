import { ReactNode } from 'react';

import { t } from '@lingui/core/macro';

import { SummaryTableItem, SummaryTableRoot } from '../../../components/summary-table';
import { TokenDetailsCard } from './token-details-card';

interface TokenDetailsTableProps {
  name: string;
  layer: string;
  price: ReactNode;
  priceChange: ReactNode;
}

export function TokenDetailsTable({ name, layer, price, priceChange }: TokenDetailsTableProps) {
  return (
    <TokenDetailsCard title={t`Token Details`}>
      <SummaryTableRoot>
        <SummaryTableItem label={t`Name`} value={name} />
        <SummaryTableItem label={t`Price`} value={price} />
        <SummaryTableItem label={t`24 Hour Change`} value={priceChange} />
        <SummaryTableItem label={t`Layer`} value={layer} />
      </SummaryTableRoot>
    </TokenDetailsCard>
  );
}
