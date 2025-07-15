import { Card } from '@/components/card';
import { useSettings } from '@/store/settings/settings';

import { OnChainActivity } from '@leather.io/models';
import { ActivityAvatarIcon, Box } from '@leather.io/ui/native';

import { useOpenURL } from '../browser/browser/use-open-url';
import { ActivityCardContent } from './activity-card-content';
import { makeActivityLink } from './utils/make-activity-link';

interface ActivityCardProps {
  activity: OnChainActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { networkPreference } = useSettings();
  const { openURL } = useOpenURL();

  const { txid, status, type } = activity;
  const activityHasAsset = 'asset' in activity;
  const asset = activityHasAsset && 'symbol' in activity.asset ? activity.asset : undefined;
  return (
    <Card
      onPress={() => {
        const activityLink = makeActivityLink({ asset, txid, networkPreference });
        if (activityLink) {
          openURL(activityLink);
        }
      }}
      width={200}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <ActivityAvatarIcon type={type} asset={asset} status={status} />
      </Box>
      <ActivityCardContent activity={activity} />
    </Card>
  );
}
