import { RefObject } from 'react';
import { Share } from 'react-native';

import { AddressTypeBadge } from '@/components/address-type-badge';
import { FullHeightSheet } from '@/components/sheets/full-height-sheet/full-height-sheet';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { QrCard } from '@/features/receive/components/qr-card';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';

import {
  AddressDisplayer,
  ArrowOutOfBoxIcon,
  Box,
  Button,
  CopyIcon,
  Pressable,
  SheetRef,
  Text,
  legacyTouchablePressEffect,
  useHaptics,
} from '@leather.io/ui/native';

import { SelectedAsset } from '../receive/screens/select-asset';

export interface ReceiveSheetData {
  asset: SelectedAsset;
  accountName: string;
}
// TODO LEA-3015: Taken from receive/screens/asset-details
// refactor to share more and keep code DRY

interface ReceiveSheetProps {
  data: ReceiveSheetData;
  sheetRef: RefObject<SheetRef | null>;
}
export function ReceiveSheet({ data, sheetRef }: ReceiveSheetProps) {
  const triggerHaptics = useHaptics();
  const { name, address, addressType, description } = data.asset;
  const onCopyAddress = useCopyAddress();

  function handleAnimatedPositionChange(fromIndex: number, toIndex: number) {
    if (fromIndex === 0 && toIndex === -1) {
      void triggerHaptics('medium');
    }
  }

  function handleDismiss() {
    analytics.track('send_sheet_dismissed');
  }
  function handleCopyAddress() {
    // analytics.track('receive_address_copied', { asset: name, location: 'details' });
    void onCopyAddress(address);
  }

  function handleShareButtonPress() {
    // analytics.track('receive_share_button_pressed', { asset: name });
    void Share.share({ message: address });
  }

  return (
    <FullHeightSheet
      sheetRef={sheetRef}
      onAnimate={handleAnimatedPositionChange}
      onDismiss={handleDismiss}
    >
      <FullHeightSheetLayout
        header={<FullHeightSheetHeader title={t`Receive`} subtitle={data.accountName} />}
      >
        <Box gap="5" px="5" flex={1}>
          <Box mt="5" mb="6">
            <QrCard value={address} />
          </Box>

          <Box gap="2">
            <Box flexDirection="row" alignItems="center" gap="1">
              <Text variant="label01">{name}</Text>
              {addressType && <AddressTypeBadge type={addressType} />}
            </Box>

            <Text variant="label02" color="ink.text-subdued">
              {description}
            </Text>
          </Box>

          <Pressable
            flexDirection="row"
            px="4"
            py="3"
            borderRadius="xs"
            borderWidth={1}
            borderColor="ink.border-default"
            alignItems="center"
            justifyContent="space-between"
            gap="2"
            pressEffects={legacyTouchablePressEffect}
            onPress={handleCopyAddress}
          >
            <Box flex={1}>
              <AddressDisplayer address={address} />
            </Box>
            <CopyIcon />
          </Pressable>

          <Button
            variant="outline"
            iconStart={ArrowOutOfBoxIcon}
            style={{ marginTop: 'auto' }}
            onPress={handleShareButtonPress}
          >
            {t`Share`}
          </Button>
        </Box>
      </FullHeightSheetLayout>
    </FullHeightSheet>
  );
}
