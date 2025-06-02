import { LinkingRef } from '@/core/browser-provider';

import { NetworkConfiguration, OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Text } from '@leather.io/ui/native';

import { formatActivityCaption, getActivityTitle } from './format-activity';

function getBalanceOperator(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return '-';
  return undefined;
}

function getBalanceColor(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset' && activity.status === 'success')
    return 'green.action-primary-default';
  return 'ink.text-primary';
}
export function serializeActivityList(
  activity: OnChainActivity,
  networkPreference: NetworkConfiguration,
  linkingRef: React.RefObject<LinkingRef | null>
) {
  const { txid, status, type, timestamp } = activity;
  const value = 'value' in activity ? activity.value : undefined;
  const activityHasAsset = 'asset' in activity;
  const asset = activityHasAsset && 'symbol' in activity.asset ? activity.asset : undefined;

  return {
    txid,
    avatar: <ActivityAvatarIcon type={type} asset={asset} status={status} />,
    title: <Text variant="label01">{getActivityTitle(activity)}</Text>,
    caption: (
      <Text variant="caption01" color="ink.text-subdued" lineHeight={16} fontSize={13}>
        {formatActivityCaption({
          type: type,
          status: status,
          timestamp: timestamp,
        })}
      </Text>
    ),
    fiatBalance: value?.fiat ? (
      <Balance
        operator={getBalanceOperator(activity)}
        balance={value.fiat}
        color={getBalanceColor(activity)}
      />
    ) : undefined,
    cryptoBalance: value?.crypto ? (
      <Balance
        balance={value.crypto}
        variant="caption01"
        color="ink.text-subdued"
        lineHeight={16}
        fontSize={13}
      />
    ) : undefined,
    onPress: () => {
      const link = makeActivityLink({ txid, networkPreference, asset });
      if (link) {
        linkingRef.current?.openURL(link);
      }
    },
  };
}
