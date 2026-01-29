import { Outlet } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { AssetList } from '@app/features/asset-list/asset-list';

import { AssetsTabHeader } from './assets-tab-header';

export function Assets() {
  return (
    <Stack data-testid={HomePageSelectors.AssetList} gap="space.04" pb="space.03">
      <AssetsTabHeader />
      <AssetList filter="enabled" />
      <Outlet />
    </Stack>
  );
}
