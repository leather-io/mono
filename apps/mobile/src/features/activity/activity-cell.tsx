import { Balance } from '@/components/balance/balance';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import dayjs from 'dayjs';

import { Activity } from '@leather.io/models';
import { Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

import { ActivityIcon } from './activity-icon';
import { formatActivityType } from './utils/format-activity';
import { goToStacksExplorer } from './utils/go-to-stacks-explorer';

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

export function ActivityCell({ activity }: ActivityCellProps) {
  const { mode } = useCurrentNetworkState();

  const txid = 'txid' in activity ? activity.txid : undefined;
  const value = 'value' in activity ? activity.value : undefined;
  const asset = 'asset' in activity ? activity.asset : undefined;
  const status = 'status' in activity ? activity.status : undefined;
  const activityAsset = asset && 'symbol' in asset ? asset : undefined;

  return (
    <Pressable
      flexDirection="row"
      disabled={!txid}
      onPress={txid ? () => goToStacksExplorer(txid, mode) : undefined}
    >
      <Flag
        img={<ActivityIcon type={activity.type} asset={activityAsset} status={status} />}
        px="5"
        py="3"
      >
        <ItemLayout
          titleLeft={formatActivityType(activity.type)}
          titleRight={
            value?.crypto ? (
              <Balance
                operator={getBalanceOperator(activity)}
                balance={value.crypto}
                color={getBalanceColor(activity)}
              />
            ) : undefined
          }
          captionLeft={dayjs(activity.timestamp * 1000).format('MMM D, YYYY')}
          captionRight={
            value?.fiat ? <Balance balance={value.fiat} color="ink.text-subdued" /> : undefined
          }
        />
      </Flag>
    </Pressable>
  );
}
