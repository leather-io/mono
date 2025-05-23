import { HasChildren } from '@leather.io/ui/native';

import { Widget } from '../../components/widget';

interface BalancesWidgetProps extends HasChildren {
  onPressHeader: () => void;
  balance: React.ReactNode;
  title: string;
}

export function BalancesWidget({ children, onPressHeader, balance, title }: BalancesWidgetProps) {
  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title title={title} balance={balance} />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}
