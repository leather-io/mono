import React from 'react';

import { t } from '@lingui/macro';

import { CollectibleCard, CollectibleCardProps } from '@leather.io/ui/native';

import { Widget, WidgetHeader } from '../components/widget';

interface CollectiblesWidgetProps {
  collectibles: CollectibleCardProps[];
  totalBalance: string;
}

export function CollectiblesWidget({ collectibles, totalBalance }: CollectiblesWidgetProps) {
  return (
    <Widget
      header={<WidgetHeader title={t`My collectibles`} totalBalance={totalBalance} />}
      scrollDirection="horizontal"
    >
      {collectibles.map((collectible: CollectibleCardProps, index) => (
        <CollectibleCard key={index} {...collectible} />
      ))}
    </Widget>
  );
}
