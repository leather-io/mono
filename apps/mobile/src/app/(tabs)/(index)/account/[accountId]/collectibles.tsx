import { Screen } from '@/components/screen/screen';
import { Collectibles } from '@/features/collectibles';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';

import { configureAccountParamsSchema } from './index';

export default function CollectiblesScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const collectibles = useAccountCollectibles(fingerprint, accountIndex);

  const pageTitle = t({
    id: 'account.collectibles.header_title',
    message: 'Collectibles',
  });
  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView refreshControl={<RefreshControl />}>
        <Screen.Title>{pageTitle}</Screen.Title>
        <Collectibles collectibles={collectibles} />
      </Screen.ScrollView>
    </Screen>
  );
}
