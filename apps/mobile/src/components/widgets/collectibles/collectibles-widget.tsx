import React, { useRef } from 'react';

import { SheetRef } from '@leather.io/ui/native';

import { TokenBalance } from '../components/balance/token-balance';
import { CollectiblesHeader } from './collectibles-header';
import { CollectiblesWidgetLayout } from './collectibles-widget.layout';
import { type Collectible } from './collectibles.mocks';
import { CollectiblesCard } from './components/collectible-card';

interface CollectiblesWidgetProps {
  collectibles: Collectible[];
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
      {collectibles.map((collectible: Collectible, index: number) => (
        <CollectiblesCard key={`collectible-${index}`} collectible={collectible} />
      ))}
    </CollectiblesWidgetLayout>
  );
}
