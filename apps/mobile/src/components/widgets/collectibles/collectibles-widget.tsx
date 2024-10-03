import React from 'react';

import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { CollectibleCard, CollectibleCardProps } from '@leather.io/ui/native';

import { Widget, WidgetHeader } from '../components/widget';

interface CollectiblesWidgetProps {
  collectibles: CollectibleCardProps[];
  totalBalance: Money;
}

export function CollectiblesWidget({ collectibles, totalBalance }: CollectiblesWidgetProps) {
  return (
    <Widget
      header={
        <WidgetHeader
          title={t({
            id: 'collectibles.header_title',
            message: 'My collectibles',
          })}
          totalBalance={totalBalance}
        />
      }
      scrollDirection="horizontal"
    >
      {collectibles.map((collectible: CollectibleCardProps, index) => (
        <CollectibleCard key={index} {...collectible} />
      ))}
    </Widget>
  );
}
