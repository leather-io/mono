import { useState } from 'react';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { Caption, IconButton, SettingsSliderIcon, Sheet, SheetHeader } from '@leather.io/ui';

import { TokenList } from '../token-list';

export function ManageTokens() {
  const [showManageTokens, setShowManageTokens] = useState(false);
  const [hasManageableTokens, setHasManageableTokens] = useState(false);

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
          <TokenList
            assetRightElementVariant="toggle"
            filter="all"
            showUnmanageableTokens={false}
            setHasManageableTokens={setHasManageableTokens}
          />

          {!hasManageableTokens && (
            <Stack h="100%" justify="center" align="center">
              <Caption>No tokens found</Caption>
            </Stack>
          )}
        </Stack>
      </Sheet>
    </>
  );
}
