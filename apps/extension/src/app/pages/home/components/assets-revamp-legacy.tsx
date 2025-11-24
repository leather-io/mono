import { Outlet } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { AssetList } from '@app/features/asset-list/asset-list';

export function AssetsRevampLegacy() {
  return (
    <Stack data-testid={HomePageSelectors.AssetList}>
      <AssetList filter="enabled" />
      <Outlet />
    </Stack>
  );
}
