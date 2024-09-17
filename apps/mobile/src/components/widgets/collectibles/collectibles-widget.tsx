import React, { useRef } from 'react';

import { CollectibleCard, CollectibleCardProps, SheetRef } from '@leather.io/ui/native';

import { TokenBalance } from '../components/balance/token-balance';
import { CollectiblesHeader } from './collectibles-header';
import { CollectiblesWidgetLayout } from './collectibles-widget.layout';

interface CollectiblesWidgetProps {
  collectibles: CollectibleCardProps[];
  totalBalance: string;
}

export function CollectiblesWidget({ collectibles, totalBalance }: CollectiblesWidgetProps) {
  const sheetRef = useRef<SheetRef>(null);

  return (
    <CollectiblesWidgetLayout
      header={
        <CollectiblesHeader
          collectibleCount={collectibles.length}
          totalBalance={totalBalance}
          sheetRef={sheetRef}
        />
      }
      balance={collectibles.length > 0 && <TokenBalance balance={totalBalance} />}
    >
      {collectibles.map((collectible: CollectibleCardProps, index) => (
        <CollectibleCard key={index} {...collectible} />
      ))}
    </CollectiblesWidgetLayout>
  );
}
