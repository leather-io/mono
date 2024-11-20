import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { useGetStacksAddresses } from '@/features/balances/stacks/use-get-stacks-addresses';
import { useStacksActivity } from '@/queries/activity/stacks-activity.query';
import { t } from '@lingui/macro';

import { ActivityCell } from './activity-cell';

interface StacksActivityCellProps {
  onPress?(): void;
}
export function StacksActivityCell({ onPress }: StacksActivityCellProps) {
  return (
    <ActivityCell
      ticker="STX"
      icon={<TokenIcon ticker="STX" />}
      tokenName={t({
        id: 'asset_name.stacks',
        message: 'Stacks',
      })}
      chain={t({
        id: 'asset_name.layer_1',
        message: 'Layer 1',
      })}
      onPress={onPress}
    />
  );
}

export function StacksActivity() {
  const addresses = useGetStacksAddresses();
  const { activity } = useStacksActivity(addresses);
  //   console.log('StacksActivity activity', activity);
  return <StacksActivityCell onPress={() => {}} />;
}

interface StacksActivityByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?(): void;
}
export function StacksActivityByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: StacksActivityByAccountProps) {
  const addresses = useGetStacksAddresses({ accountIndex, fingerprint });
  const { activity } = useStacksActivity(addresses);
  //   console.log('StacksActivityByAccount activity', activity);
  return <StacksActivityCell onPress={onPress} />;
}
