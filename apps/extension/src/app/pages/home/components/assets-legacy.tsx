import { Outlet } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { AssetList } from '@app/features/asset-list/asset-list';
import { ManageTokens } from '@app/features/asset-list/manage-tokens/manage-tokens';

export function AssetsLegacy() {
  return (
    <Stack data-testid={HomePageSelectors.AssetList}>
      <AssetList filter="enabled" />
      <ManageTokens />
      <Outlet />
    </Stack>
  );
}
