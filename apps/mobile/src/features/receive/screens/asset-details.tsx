import { Share } from 'react-native';

import { AddressTypeBadge } from '@/components/address-type-badge';
import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { QrCard } from '@/features/receive/components/qr-card';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { TestId } from '@/shared/test-id';
import { useAccounts } from '@/store/accounts/accounts.read';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';

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
import { assertExistence } from '@leather.io/utils';

import { useReceiveNavigation, useReceiveRoute } from '../navigation';
import { useReceiveFlowContext } from '../receive-flow-provider';

export function AssetDetails() {
  const route = useReceiveRoute<'asset-details'>();
  const navigation = useReceiveNavigation();
  // Don't allow going back from token-details screen
  const canGoBack = route.params?.previousRoute === 'select-asset';
  const {
    state: { selectedAsset, currentAccount },
  } = useReceiveFlowContext();
  const { fromAccountIndex } = useAccounts();
  const account = fromAccountIndex(currentAccount.fingerprint, currentAccount.accountIndex)[0];
  assertExistence(selectedAsset, 'selectedAsset should be set in AssetDetails');
  const { name, address, addressType, description } = selectedAsset;
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
          title={t`Receive`}
          subtitle={account?.name}
          leftElement={
            canGoBack ? (
              <HeaderBackButton onPress={navigation.goBack} testID={TestId.backButton} />
            ) : null
          }
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
          variant="outline"
          iconStart={ArrowOutOfBoxIcon}
          style={{ marginTop: 'auto' }}
          onPress={handleShareButtonPress}
        >
          {t`Share`}
        </Button>
      </Box>
    </FullHeightSheetLayout>
  );
}
