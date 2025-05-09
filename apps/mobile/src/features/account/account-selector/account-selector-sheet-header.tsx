import { RefObject } from 'react';

import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { router } from 'expo-router';

import {
  Box,
  Pressable,
  SettingsGearIcon,
  SheetRef,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface AccountSelectorHeaderProps {
  sheetRef: RefObject<SheetRef>;
}
// TODO: refactor HeaderLayout so that we can use it here
export function AccountSelectorHeader({ sheetRef }: AccountSelectorHeaderProps) {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="space-between" py="5">
      <Box alignItems="center" justifyContent="center" left={0} position="absolute" right={0}>
        <Text variant="heading05">
          {t({
            id: 'account_selector.header_title',
            message: 'All accounts',
          })}
        </Text>
      </Box>
      <Box alignItems="flex-end" flexGrow={1} justifyContent="center" zIndex="20">
        <Pressable
          hitSlop={12}
          onPress={() => {
            sheetRef.current?.close();
            router.navigate(AppRoutes.SettingsWallet);
          }}
          testID={TestId.settingsWalletAndAccountsButton}
          pressEffects={legacyTouchablePressEffect}
        >
          <SettingsGearIcon />
        </Pressable>
      </Box>
    </Box>
  );
}
