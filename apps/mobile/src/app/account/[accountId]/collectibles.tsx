import { Screen } from '@/components/screen/screen';
import { Collectibles } from '@/features/collectibles';
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

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>
          {t({
            id: 'account.collectibles.header_title',
            message: 'Collectibles',
          })}
        </Screen.Title>
        <Collectibles collectibles={collectibles} />
      </Screen.ScrollView>
    </Screen>
  );
}
