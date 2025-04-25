import { TokenBalance } from '@/features/balances/token-balance';
import { t } from '@lingui/macro';

import { HasChildren } from '@leather.io/ui/native';

import { Widget } from '../../components/widget';

interface BalancesWidgetProps extends HasChildren {
  onPressHeader: () => void;
  totalBalance: TokenBalance;
  isLoading: boolean;
}

export function BalancesWidget({
  children,
  onPressHeader,
  totalBalance,
  isLoading,
}: BalancesWidgetProps) {
  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title
          title={t({ id: 'balances.header_title', message: 'My tokens' })}
          totalBalance={totalBalance}
          isLoading={isLoading}
        />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}
