import { Balance } from '@/components/balance/balance';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Flag, ItemLayout, Pressable, Text } from '@leather.io/ui/native';

import { formatActivityCaption, getActivityTitle } from './utils/format-activity';
import { goToStacksExplorer } from './utils/go-to-stacks-explorer';

interface ActivityListItemProps {
  activity: OnChainActivity;
}

function getBalanceOperator(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return '-';
  return undefined;
}

function getBalanceColor(activity: OnChainActivity) {
  const isSendOrReceive = activity.type === 'sendAsset' || activity.type === 'receiveAsset';
  if (isSendOrReceive && activity.status === 'success') return 'green.action-primary-default';
  return 'ink.text-primary';
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
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
        img={<ActivityAvatarIcon type={activity.type} asset={activityAsset} status={status} />}
        px="5"
        py="3"
      >
        <ItemLayout
          gap="0"
          titleLeft={<Text variant="label01">{getActivityTitle(activity)}</Text>}
          titleRight={
            value?.fiat ? (
              <Balance
                operator={getBalanceOperator(activity)}
                balance={value.fiat}
                color={getBalanceColor(activity)}
              />
            ) : undefined
          }
          captionLeft={
            <Text variant="caption01" color="ink.text-subdued" lineHeight={16} fontSize={13}>
              {formatActivityCaption({
                type: activity.type,
                status: activity.status,
                timestamp: activity.timestamp,
              })}
            </Text>
          }
          captionRight={
            value?.crypto ? (
              <Balance
                balance={value.crypto}
                variant="caption01"
                color="ink.text-subdued"
                lineHeight={16}
                fontSize={13}
              />
            ) : undefined
          }
        />
      </Flag>
    </Pressable>
  );
}
