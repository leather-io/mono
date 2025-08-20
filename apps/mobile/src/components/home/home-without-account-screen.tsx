import { Screen } from '@/components/screen/screen';
import { HeaderActions } from '@/components/screen/screen-header/components/header-actions';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { CreateWalletCard } from '@/features/account/components/create-wallet-card';
import { NetworkBadge } from '@/features/settings/network-badge';

import { Box, LeatherLogomarkIcon } from '@leather.io/ui/native';

export function HomeScreenWithoutAccount() {
  const { addWalletSheetRef } = useGlobalSheets();

  return (
    <Screen>
      <Screen.Header
        leftElement={
          <Box flexDirection="row" alignItems="center" p="2" gap="2">
            <LeatherLogomarkIcon />
            <NetworkBadge />
          </Box>
        }
        rightElement={<HeaderActions />}
      />
      <Box p="5">
        <CreateWalletCard onPress={() => addWalletSheetRef.current?.present()} />
      </Box>
    </Screen>
  );
}
