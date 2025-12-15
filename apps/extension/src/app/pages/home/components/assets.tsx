import { Outlet, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import type { TokenDetailsProps } from '@leather.io/features';

import { RouteUrls } from '@shared/route-urls';

import { AssetList } from '@app/features/asset-list/asset-list';

export function Assets() {
  const navigate = useNavigate();

  function handleOpenToken({ assetId }: TokenDetailsProps) {
    navigate(RouteUrls.TokenDetails.replace(':assetId', assetId));
  }

  return (
    <Stack data-testid={HomePageSelectors.AssetList}>
      <AssetList filter="enabled" onOpenToken={handleOpenToken} />
      <Outlet />
    </Stack>
  );
}
