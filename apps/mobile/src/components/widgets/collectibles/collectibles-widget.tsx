import { ScrollView } from 'react-native-gesture-handler';

import { FetchState } from '@/shared/fetch-state';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { Theme } from '@leather.io/ui/native';

import { Widget } from '../components/widget';
import { CollectiblesLayout } from './collectibles.layout';

interface CollectiblesWidgetProps {
  collectibles: FetchState<NonFungibleCryptoAssetInfo[]>;
  onPressHeader: () => void;
}

export function CollectiblesWidget({ onPressHeader, collectibles }: CollectiblesWidgetProps) {
  const theme = useTheme<Theme>();
  // TODO LEA-1726: Handle loading and error states
  if (collectibles.state !== 'success') return null;
  const hasCollectibles = collectibles.value && collectibles.value.length > 0;
  if (!hasCollectibles) return null;

  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title
          title={t({
            id: 'collectibles.header_title',
            message: 'My collectibles',
          })}
        />
      </Widget.Header>
      <Widget.Body>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing['3'],
          }}
        >
          <CollectiblesLayout collectibles={collectibles.value} mode="widget" />
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
