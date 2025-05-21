import { HorizontalScrollView } from '@/components/horizontal-scroll-view';
import { Widget } from '@/components/widget';

interface CollectiblesWidgetProps {
  children: React.ReactNode;
  onPressHeader: () => void;
  title: string;
}

export function CollectiblesWidget({ children, onPressHeader, title }: CollectiblesWidgetProps) {
  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title title={title} />
      </Widget.Header>
      <Widget.Body>
        <HorizontalScrollView>{children}</HorizontalScrollView>
      </Widget.Body>
    </Widget>
  );
}
