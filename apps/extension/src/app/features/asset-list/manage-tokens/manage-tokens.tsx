import { useState } from 'react';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import {
  Caption,
  IconButton,
  SettingsSliderIcon,
  Sheet,
  SheetHeader,
  Spinner,
} from '@leather.io/ui';

import { AssetList } from '../asset-list';

export function ManageTokens() {
  const [showManageTokens, setShowManageTokens] = useState(false);
  const [hasManageableTokens, setHasManageableTokens] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <IconButton
        data-testid={HomePageSelectors.ManageTokensBtn}
        icon={<SettingsSliderIcon variant="small" />}
        onClick={() => setShowManageTokens(!showManageTokens)}
        width="40px"
        height="40px"
      />

      <Sheet
        isShowing={showManageTokens}
        onClose={() => setShowManageTokens(!showManageTokens)}
        header={<SheetHeader title="Manage tokens" />}
      >
        <Stack gap="space.05" px="space.05" data-testid={HomePageSelectors.ManageTokensAssetsList}>
          <AssetList
            assetRightElementVariant="toggle"
            filter="all"
            showUnmanageableTokens={false}
            setHasManageableTokens={setHasManageableTokens}
            setIsLoading={setIsLoading}
          />

          {isLoading && (
            <Stack h="100%" justify="center" align="center">
              <Spinner size="md" />
            </Stack>
          )}

          {!isLoading && !hasManageableTokens && (
            <Stack h="100%" justify="center" align="center">
              <Caption>No tokens found</Caption>
            </Stack>
          )}
        </Stack>
      </Sheet>
    </>
  );
}
