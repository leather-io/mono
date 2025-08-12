import { Screen } from '@/components/screen/screen';
import { ActivityFlashList } from '@/features/activity/activity-flashlist';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';
import { useLocalSearchParams } from 'expo-router';

import { Text } from '@leather.io/ui/native';

import { configureAccountParamsSchema } from './';

export default function AccountActivityScreen() {
  const params = useLocalSearchParams();
  const { accountId, accountName = '' } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const activity = useAccountActivity(fingerprint, accountIndex);

  return (
    <Screen>
      <Screen.Header centerElement={<Text variant="label01">{accountName}</Text>} />
      <ActivityFlashList
        data={activity}
        header={<Screen.Title>{t`${accountName} Activity`}</Screen.Title>}
      />
    </Screen>
  );
}
