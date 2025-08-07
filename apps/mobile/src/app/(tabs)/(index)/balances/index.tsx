import { Screen } from '@/components/screen/screen';
import { HeaderTitleWithSubtitle } from '@/components/screen/screen-header/components/header-title-with-subtitle';
import { AssetsFlashList } from '@/features/balances/assets/assets-flashlist';
import { TotalBalance } from '@/features/balances/total-balance';
import { useRunesTotalBalance } from '@/queries/balance/runes-balance.query';
import { useSip10TotalBalance } from '@/queries/balance/sip10-balance.query';
import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

export interface OnOpenTokenProps {
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
}

export default function BalancesScreen() {
  const sip10Data = useSip10TotalBalance();
  const runesData = useRunesTotalBalance();

  const pageTitle = t`All tokens`;

  AssetsFlashList;

  return (
    <Screen>
      <Screen.Header
        centerElement={
          <HeaderTitleWithSubtitle
            title={<TotalBalance variant="heading05" />}
            subtitle={pageTitle}
          />
        }
      />
      <AssetsFlashList
        header={
          <Screen.HeaderAnimationTarget>
            <Box px="5" pb="5" mb="3">
              <Text variant="label01">{pageTitle}</Text>
              <TotalBalance variant="heading03" />
            </Box>
          </Screen.HeaderAnimationTarget>
        }
        sip10Data={sip10Data}
        runesData={runesData}
      />
    </Screen>
  );
}
