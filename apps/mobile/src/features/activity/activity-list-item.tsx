import { Balance } from '@/components/balance/balance';
import { useSettings } from '@/store/settings/settings';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Flag, ItemLayout, Pressable, Text } from '@leather.io/ui/native';
import { minusSign } from '@leather.io/utils';

import { useOpenURL } from '../browser/browser/use-open-url';
import { formatActivityCaption, getActivityTitle } from './utils/format-activity';
import { makeActivityLink } from './utils/make-activity-link';

interface ActivityListItemProps {
  activity: OnChainActivity;
}

function getBalanceOperator(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return minusSign;
  return undefined;
}

function getBalanceColor(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset' && activity.status === 'success')
    return 'green.action-primary-default';
  return 'ink.text-primary';
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { networkPreference } = useSettings();
  const { openURL } = useOpenURL();

  const { txid, status, type, timestamp } = activity;
  const value = 'value' in activity ? activity.value : undefined;
  const activityHasAsset = 'asset' in activity;
  const asset = activityHasAsset && 'symbol' in activity.asset ? activity.asset : undefined;

  return (
    <Pressable
      disabled={!txid}
      onPress={() => {
        const activityLink = makeActivityLink({ txid, networkPreference, asset });
        if (activityLink) {
          openURL(activityLink);
        }
      }}
    >
      <Flag img={<ActivityAvatarIcon type={type} asset={asset} status={status} />} px="5" py="3">
        <ItemLayout
          gap="0"
          titleLeft={
            <Text variant="label01" fontSize={15}>
              {getActivityTitle(activity)}
            </Text>
          }
          titleRight={
            value?.quote ? (
              <Balance
                operator={getBalanceOperator(activity)}
                balance={value.quote}
                color={getBalanceColor(activity)}
                fontSize={15}
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
                formattingOptions={{ showCurrency: false }}
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
