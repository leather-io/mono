import { ScrollView } from 'react-native-gesture-handler';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { Widget } from '../../components/widget';

interface CollectiblesWidgetProps {
  children: React.ReactNode;
  onPressHeader: () => void;
}

export function CollectiblesWidget({ children, onPressHeader }: CollectiblesWidgetProps) {
  const theme = useTheme<Theme>();

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
          {children}
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
