import { Outlet, useLocation, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import type { TokenDetailsProps } from '@leather.io/features';

import { createTokenDetailsPath } from '@app/common/asset-url';
import { AssetList } from '@app/features/asset-list/asset-list';

export function Assets() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleOpenToken({ assetId }: TokenDetailsProps) {
    void navigate(createTokenDetailsPath(assetId), { state: { backgroundLocation: location } });
  }

  return (
    <Stack data-testid={HomePageSelectors.AssetList}>
      <AssetList filter="enabled" onOpenToken={handleOpenToken} />
      <Outlet />
    </Stack>
  );
}
