import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { HasChildren } from '@leather.io/ui/native';

import { Widget } from '../components/widget';

interface BalancesWidgetProps extends HasChildren {
  onPressHeader: () => void;
  totalBalance: Money;
}

export function BalancesWidget({ children, onPressHeader, totalBalance }: BalancesWidgetProps) {
  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title
          title={t({ id: 'balances.header_title', message: 'My tokens' })}
          totalBalance={totalBalance}
        />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}
