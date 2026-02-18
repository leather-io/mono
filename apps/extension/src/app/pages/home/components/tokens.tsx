import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { createTokenDetailsPath } from '@leather.io/features';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { TokenList } from '@app/features/asset-list/token-list';
import { Outlet, useLocation, useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { modalNavigationSlice } from '@app/store/navigation/modal-navigation.slice';

import { TokensTabHeader } from './tokens-tab-header';

export function Tokens() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  function handleSelectAsset(assetId: SerializedCryptoAssetId) {
    dispatch(modalNavigationSlice.actions.setBackgroundLocationPathname(location.pathname));
    void navigate(createTokenDetailsPath(assetId));
  }

  return (
    <Stack data-testid={HomePageSelectors.AssetList} gap="space.04" pb="space.03">
      <TokensTabHeader />
      <TokenList filter="enabled" onSelectAsset={handleSelectAsset} />
      <Outlet />
    </Stack>
  );
}
