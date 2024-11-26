import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Money } from '@leather.io/models';
import { CollectibleCard, CollectibleCardProps, Theme } from '@leather.io/ui/native';

import { Widget } from '../components/widget';

interface CollectiblesWidgetProps {
  collectibles: CollectibleCardProps[];
  totalBalance: Money;
}

export function CollectiblesWidget({ collectibles, totalBalance }: CollectiblesWidgetProps) {
  const theme = useTheme<Theme>();

  return (
    <Widget>
      <Widget.Header>
        <Widget.Title
          title={t({
            id: 'collectibles.header_title',
            message: 'My collectibles',
          })}
          totalBalance={totalBalance}
        />
      </Widget.Header>
      <Widget.Body>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing['3'],
            paddingHorizontal: theme.spacing['5'],
          }}
        >
          {collectibles.map((collectible: CollectibleCardProps, index) => (
            <CollectibleCard key={index} {...collectible} />
          ))}
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
