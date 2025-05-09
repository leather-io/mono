import { TokenBalance } from '@/features/balances/token-balance';

import { HasChildren } from '@leather.io/ui/native';

import { Widget } from '../../components/widget';

interface BalancesWidgetProps extends HasChildren {
  onPressHeader: () => void;
  totalBalance: TokenBalance;
  isLoading: boolean;
  title: string;
}

export function BalancesWidget({
  children,
  onPressHeader,
  totalBalance,
  isLoading,
  title,
}: BalancesWidgetProps) {
  return (
    <Widget>
      <Widget.Header onPress={onPressHeader}>
        <Widget.Title title={title} totalBalance={totalBalance} isLoading={isLoading} />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}
