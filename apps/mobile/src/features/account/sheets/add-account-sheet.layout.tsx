import { RefObject } from 'react';

import { AddWalletCell } from '@/features/wallet-manager/add-wallet/add-wallet-cell';
import { t } from '@lingui/macro';

import {
  Box,
  PlusIcon,
  Sheet,
  SheetRef,
  Text,
  ThemeVariant,
  WalletPlusIcon,
} from '@leather.io/ui/native';

interface AddAccountSheetBaseProps {
  addAccountSheetRef: RefObject<SheetRef | null>;
}

interface AddAccountSheetLayoutProps extends AddAccountSheetBaseProps {
  addToWallet(): unknown;
  addToNewWallet(): unknown;
  themeVariant: ThemeVariant;
}
export function AddAccountSheetLayout({
  addAccountSheetRef,
  addToWallet,
  addToNewWallet,
  themeVariant,
}: AddAccountSheetLayoutProps) {
  return (
    <Sheet isScrollView ref={addAccountSheetRef} themeVariant={themeVariant}>
      <Box gap="1">
        <Text p="5" variant="heading05">
          {t({ id: 'add_account.header_title', message: 'Add account' })}
        </Text>
        <Box flexDirection="column" pb="7">
          <AddWalletCell
            onPress={addToWallet}
            title={t({
              id: 'add_account.existing_wallet.cell_title',
              message: 'Add to existing wallet',
            })}
            caption={t({
              id: 'add_account.existing_wallet.cell_caption',
              message: 'Choose existing wallet',
            })}
            icon={<WalletPlusIcon />}
          />
          <AddWalletCell
            onPress={addToNewWallet}
            title={t({
              id: 'add_account.new_wallet.cell_title',
              message: 'Add to new wallet',
            })}
            caption={t({
              id: 'add_account.new_wallet.cell_caption',
              message: 'Generate new Secret Key for self-custody',
            })}
            icon={<PlusIcon />}
          />
        </Box>
      </Box>
    </Sheet>
  );
}
