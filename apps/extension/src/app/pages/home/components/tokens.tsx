import { Outlet, useLocation, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { createTokenDetailsPath } from '@leather.io/features';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { TokenList } from '@app/features/asset-list/token-list';
import { useFlags } from '@app/features/feature-flags';
import { TrendingTokens } from '@app/features/trending-tokens/trending-tokens';
import { useActivity } from '@app/query/activity/activity.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { FirstTokenBanner } from './first-token-banner';
import { TokensLearn } from './tokens-learn';
import { TokensTabHeader } from './tokens-tab-header';

export function Tokens() {
  const navigate = useNavigate();
  const location = useLocation();
  const { releaseTrendingTokens } = useFlags();
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const activityQuery = useActivity(account);
  const showFirstTokenBanner = activityQuery.isSuccess && !activityQuery.data?.length;

  function handleSelectAsset(assetId: SerializedCryptoAssetId) {
    void navigate(createTokenDetailsPath(assetId), { state: { backgroundLocation: location } });
  }

  return (
    <Stack data-testid={HomePageSelectors.AssetList} gap="space.04" pb="space.03">
      {showFirstTokenBanner && <FirstTokenBanner />}
      {!showFirstTokenBanner && <TokensTabHeader />}
      <TokenList filter="enabled" onSelectAsset={handleSelectAsset} showDepositButtons />
      {releaseTrendingTokens && <TrendingTokens />}
      <TokensLearn />
      <Outlet />
    </Stack>
  );
}
