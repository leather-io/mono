import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetPicker } from '@/features/send/components/asset-picker/asset-picker';

import { FungibleCryptoAsset } from '@leather.io/models';
import { Sheet, SheetRef } from '@leather.io/ui/native';

interface InlineAssetPickerProps {
  sheetRef: SheetRef;
  onSelectAsset(asset: FungibleCryptoAsset): void;
  fingerprint: string;
  accountIndex: number;
}

export function InlineAssetPicker({
  sheetRef,
  onSelectAsset,
  fingerprint,
  accountIndex,
}: InlineAssetPickerProps) {
  const { top } = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const minimumTopOffset = 80;
  const offsetTop = Math.max(top, minimumTopOffset);

  function handleSelectAsset(asset: FungibleCryptoAsset) {
    onSelectAsset(asset);
    sheetRef.current?.close();
  }

  return (
    <Sheet ref={sheetRef} maxDynamicContentSize={height - Math.max(offsetTop)}>
      <Sheet.ScrollView pt="5">
        <AssetPicker
          fingerprint={fingerprint}
          accountIndex={accountIndex}
          onSelectAsset={handleSelectAsset}
        />
      </Sheet.ScrollView>
    </Sheet>
  );
}
