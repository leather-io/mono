import { Balance } from '@/components/balance/balance';
import { useBrowser } from '@/core/browser-provider';
import { useSettings } from '@/store/settings/settings';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Flag, ItemLayout, Pressable, Text } from '@leather.io/ui/native';

import { formatActivityCaption, getActivityTitle } from './utils/format-activity';
import { makeActivityLink } from './utils/make-activity-link';

interface ActivityListItemProps {
  activity: OnChainActivity;
}

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

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { networkPreference } = useSettings();
  const { linkingRef } = useBrowser();

  const { txid, status, type, timestamp } = activity;
  const value = 'value' in activity ? activity.value : undefined;
  const activityHasAsset = 'asset' in activity;
  const asset = activityHasAsset && 'symbol' in activity.asset ? activity.asset : undefined;

  return (
    <Pressable
      flexDirection="row"
      disabled={!txid}
      onPress={() => {
        const activityLink = makeActivityLink({ txid, networkPreference, asset });
        if (activityLink) {
          linkingRef.current?.openURL(activityLink);
        }
      }}
    >
      <Flag img={<ActivityAvatarIcon type={type} asset={asset} status={status} />} px="5" py="3">
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
                type: type,
                status: status,
                timestamp: timestamp,
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
