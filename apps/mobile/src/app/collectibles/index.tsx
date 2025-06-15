import { Screen } from '@/components/screen/screen';
import { Collectibles } from '@/features/collectibles';
import { useTotalCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { t } from '@lingui/macro';

export default function CollectiblesScreen() {
  const collectibles = useTotalCollectibles();

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>
          {t({
            id: 'collectibles.header_title',
            message: 'All collectibles',
          })}
        </Screen.Title>
        <Collectibles collectibles={collectibles} />
      </Screen.ScrollView>
    </Screen>
  );
}
