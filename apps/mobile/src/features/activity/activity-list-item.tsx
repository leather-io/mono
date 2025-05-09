import { Balance } from '@/components/balance/balance';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';

import { Activity } from '@leather.io/models';
import { ActivityAvatarIcon, Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

import { formatActivityCaption, getActivityTitle } from './utils/format-activity';
import { goToStacksExplorer } from './utils/go-to-stacks-explorer';

interface ActivityListItemProps {
  activity: Activity;
}

function getBalanceOperator(activity: Activity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return '-';
  return undefined;
}

function getBalanceColor(activity: Activity) {
  const isSendOrReceive = activity.type === 'sendAsset' || activity.type === 'receiveAsset';
  if (isSendOrReceive && activity.status === 'success') return 'green.action-primary-default';
  return undefined;
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
          titleLeft={getActivityTitle(activity)}
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
            // FIXME LEA-2473 - should pre-filter all activities
            // to only include these types - onChain using OnChainActivity type / BaseOnChainActivity
            activity.type === 'sendAsset' ||
            activity.type === 'receiveAsset' ||
            activity.type === 'swapAssets' ||
            activity.type === 'executeSmartContract' ||
            activity.type === 'deploySmartContract'
              ? formatActivityCaption({
                  activityType: activity.type,
                  status: activity.status,
                  timestamp: activity.timestamp,
                })
              : undefined
          }
          captionRight={
            value?.crypto ? <Balance balance={value.crypto} color="ink.text-subdued" /> : undefined
          }
        />
      </Flag>
    </Pressable>
  );
}
