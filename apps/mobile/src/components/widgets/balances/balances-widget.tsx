import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { Widget } from '../components/widget';

interface BalancesWidgetProps extends HasChildren {
  onPressHeader: () => void;
}

export function BalancesWidget({ children, onPressHeader }: BalancesWidgetProps) {
  const { totalBalance } = useTotalBalance();
  if (totalBalance.state !== 'success') return;
  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title
          title={t({ id: 'balances.header_title', message: 'My tokens' })}
          totalBalance={totalBalance.value}
        />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}
