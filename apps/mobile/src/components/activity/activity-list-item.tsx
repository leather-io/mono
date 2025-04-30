import { formatActivityType } from '@/app/activity/utils/format-activity';
import { goToStacksExplorer } from '@/app/activity/utils/go-to-stacks-explorer';
import { ActivityIcon } from '@/components/activity/activity-icon';
import { Balance } from '@/components/balance/balance';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import dayjs from 'dayjs';

import { Activity } from '@leather.io/models';
import { Cell } from '@leather.io/ui/native';

interface ActivityCellProps {
  activity: Activity;
}

function getBalanceOperator(activity: Activity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return '-';
  return undefined;
}

function getBalanceColor(activity: Activity) {
  if (activity.type === 'receiveAsset' && activity.status === 'success')
    return 'green.action-primary-default';
  if (activity.type === 'sendAsset' && activity.status === 'success')
    return 'red.action-primary-default';
  return undefined;
}

export function ActivityListItem({ activity }: ActivityCellProps) {
  const { mode } = useCurrentNetworkState();

  const txid = 'txid' in activity ? activity.txid : undefined;
  const value = 'value' in activity ? activity.value : undefined;
  const asset = 'asset' in activity ? activity.asset : undefined;
  const status = 'status' in activity ? activity.status : undefined;
  const activityAsset = asset && 'symbol' in asset ? asset : undefined;

  return (
    <Cell.Root
      pressable
      disabled={!txid}
      onPress={txid ? () => goToStacksExplorer(txid, mode) : undefined}
    >
      <Cell.Icon>
        <ActivityIcon type={activity.type} asset={activityAsset} status={status} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{formatActivityType(activity.type)}</Cell.Label>
        <Cell.Label variant="secondary">{dayjs(activity.timestamp * 1000).fromNow()}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          {value?.fiat ? (
            <Balance
              variant="label02"
              operator={getBalanceOperator(activity)}
              balance={value.fiat}
              color={getBalanceColor(activity)}
            />
          ) : undefined}
        </Cell.Label>
        <Cell.Label variant="secondary">
          {value?.crypto ? (
            <Balance variant="caption01" balance={value.crypto} color="ink.text-subdued" />
          ) : undefined}
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
