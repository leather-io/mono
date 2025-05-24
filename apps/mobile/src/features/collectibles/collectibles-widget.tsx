import { ScrollView } from 'react-native-gesture-handler';

import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { Widget } from '../../components/widget';

interface CollectiblesWidgetProps {
  children: React.ReactNode;
  onPressHeader: () => void;
  title: string;
}

export function CollectiblesWidget({ children, onPressHeader, title }: CollectiblesWidgetProps) {
  const theme = useTheme<Theme>();

  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title title={title} />
      </Widget.Header>
      <Widget.Body>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing['3'],
            paddingHorizontal: theme.spacing['5'],
          }}
          style={{
            // prevent card shadows being cut off
            overflow: 'visible',
          }}
        >
          {children}
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
