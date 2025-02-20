import { RefObject } from 'react';

import { AssetPicker } from '@/features/send/components/asset-picker/asset-picker';
import { SendableAsset } from '@/features/send/types';
import { Account } from '@/store/accounts/accounts';
import { useSettings } from '@/store/settings/settings';

import { Box, Sheet, SheetRef } from '@leather.io/ui/native';

interface InlineAssetPickerProps {
  sheetRef: RefObject<SheetRef>;
  account: Account;
  onSelectAsset(asset: SendableAsset): void;
}

export function InlineAssetPicker({ sheetRef, account, onSelectAsset }: InlineAssetPickerProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  function handleSelectAsset(asset: SendableAsset) {
    onSelectAsset(asset);
    sheetRef.current?.close();
  }

  return (
    <Sheet themeVariant={themeDerivedFromThemePreference} ref={sheetRef}>
      <Box pt="5">
        <AssetPicker account={account} onSelectAsset={handleSelectAsset} />
      </Box>
    </Sheet>
  );
}
