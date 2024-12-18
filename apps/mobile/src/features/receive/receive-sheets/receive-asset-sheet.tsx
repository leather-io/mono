import { Pressable, Share } from 'react-native';

import { AddressTypeBadge } from '@/components/address-type-badge';
import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import {
  AddressDisplayer,
  ArrowOutOfBoxIcon,
  Box,
  Cell,
  CopyIcon,
  IconButton,
  Text,
} from '@leather.io/ui/native';

import { SelectedAsset } from './select-asset';

interface ReceiveAssetSheetProps {
  accountName: string;
  selectedAsset: SelectedAsset;
  onCopy: () => void;
  onGoBack: () => void;
}
export function ReceiveAssetSheet({
  accountName,
  selectedAsset,
  onCopy,
  onGoBack,
}: ReceiveAssetSheetProps) {
  const { i18n } = useLingui();
  const { assetName, address, addressType, assetDescription } = selectedAsset;

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
          leftElement={<HeaderBackButton onPress={onGoBack} testID={TestId.backButton} />}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <Box gap="6" px="5">
        <Box flexDirection="column" gap="2">
          <Box alignItems="center" flexDirection="row" gap="1">
            <Text variant="label02">{assetName}</Text>
            {addressType && <AddressTypeBadge type={addressType} />}
          </Box>
          <Box>
            <Text variant="label02" color="ink.text-subdued">
              {assetDescription}
            </Text>
          </Box>
        </Box>
        <Box>
          <Cell.Root
            pressable={false}
            borderRadius="xs"
            borderWidth={1}
            borderColor="ink.border-default"
            padding="2"
          >
            <Cell.Content>
              <AddressDisplayer address={address} />
            </Cell.Content>
            <Cell.Aside>
              <IconButton icon={<CopyIcon />} onPress={onCopy} />
            </Cell.Aside>
          </Cell.Root>
        </Box>

        <Pressable
          onPress={async () =>
            await Share.share({
              message: address,
            })
          }
        >
          <Box
            borderRadius="xs"
            borderWidth={1}
            borderColor="ink.border-default"
            p="3"
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            gap="2"
          >
            <ArrowOutOfBoxIcon />
            <Text variant="label02">
              {t({
                id: 'receive_asset.share_button',
                message: 'Share',
              })}
            </Text>
          </Box>
        </Pressable>
      </Box>
    </FullHeightSheetLayout>
  );
}
