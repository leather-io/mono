import { Outlet } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { TokenList } from '@app/features/asset-list/token-list';

import { TokensTabHeader } from './tokens-tab-header';

export function Tokens() {
  return (
    <Stack data-testid={HomePageSelectors.AssetList} gap="space.04" pb="space.03">
      <TokensTabHeader />
      <TokenList filter="enabled" />
      <Outlet />
    </Stack>
  );
}
