import { useCallback } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AddWalletCell } from '@/features/wallet-manager/add-wallet/add-wallet-cell';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { Box, PlusIcon, Sheet, WalletPlusIcon } from '@leather.io/ui/native';

export function AddAccountSheet() {
  const router = useRouter();
  const { addAccountSheetRef, addWalletSheetRef } = useGlobalSheets();
  const addToWallet = useCallback(() => {
    router.navigate('/settings/wallet');
    addAccountSheetRef.current?.close();
  }, [addAccountSheetRef, router]);

  const addToNewWallet = useCallback(() => {
    addWalletSheetRef.current?.present();
    addAccountSheetRef.current?.close();
  }, [addAccountSheetRef, addWalletSheetRef]);

  return (
    <Sheet ref={addAccountSheetRef}>
      <Sheet.View gap="3">
        <Sheet.Header leftElement={<Sheet.Title>{t`Add account`}</Sheet.Title>} />
        <Box>
          <AddWalletCell
            onPress={addToWallet}
            title={t`Add to existing wallet`}
            caption={t`Choose existing wallet`}
            icon={<WalletPlusIcon />}
          />
          <AddWalletCell
            onPress={addToNewWallet}
            title={t`Add to new wallet`}
            caption={t`Generate new Secret Key for self-custody`}
            icon={<PlusIcon />}
          />
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
