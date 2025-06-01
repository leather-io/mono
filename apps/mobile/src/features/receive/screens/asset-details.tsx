import { Share } from 'react-native';

import { AddressTypeBadge } from '@/components/address-type-badge';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { QrCard } from '@/features/receive/components/qr-card';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import {
  AddressDisplayer,
  ArrowOutOfBoxIcon,
  Box,
  Button,
  CopyIcon,
  Pressable,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

import { useCopyAddress, useReceiveNavigation, useReceiveRoute } from '../navigation';

export function AssetDetails() {
  const { i18n } = useLingui();
  const route = useReceiveRoute<'asset-details'>();
  const navigation = useReceiveNavigation();
  const asset = route.params.asset;
  const accountName = route.params.accountName;
  const { name, address, addressType, description } = asset;
  const onCopyAddress = useCopyAddress();

  function handleCopyAddress() {
    analytics.track('receive_address_copied', { asset: name, location: 'details' });
    void onCopyAddress(address);
  }

  function handleShareButtonPress() {
    analytics.track('receive_share_button_pressed', { asset: name });
    void Share.share({ message: address });
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'receive_asset.header_title',
            message: 'Receive',
          })}
          subtitle={i18n._({
            id: 'select_asset.header_subtitle',
            message: '{subtitle}',
            values: { subtitle: accountName },
          })}
          leftElement={<HeaderBackButton onPress={navigation.goBack} testID={TestId.backButton} />}
          rightElement={<NetworkBadge />}
        />
      }
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
          title={t({ id: 'receive_asset.share_button', message: 'Share' })}
          buttonState="outline"
          icon={<ArrowOutOfBoxIcon />}
          style={{ marginTop: 'auto' }}
          onPress={handleShareButtonPress}
        />
      </Box>
    </FullHeightSheetLayout>
  );
}
