import { Outlet, useLocation, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { createTokenDetailsPath } from '@leather.io/features';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { TokenList } from '@app/features/asset-list/token-list';
import { useFlags } from '@app/features/feature-flags';
import { TrendingTokens } from '@app/features/trending-tokens/trending-tokens';
import { useBlockchainActivityFeed } from '@app/query/activity/blockchain-activity.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';

import { AeusdcRetirementCallout } from './aeusdc-retirement-callout';
import { FirstTokenBanner } from './first-token-banner';
import { TokensLearn } from './tokens-learn';
import { TokensTabHeader } from './tokens-tab-header';

export function Tokens() {
  const navigate = useNavigate();
  const location = useLocation();
  const { releaseTrendingTokens } = useFlags();
  const account = useCurrentAccountAddresses();
  const activityFeed = useBlockchainActivityFeed(account);
  const showFirstTokenBanner = activityFeed.isSuccess && !activityFeed.items.length;

  function handleSelectAsset(assetId: SerializedCryptoAssetId) {
    void navigate(createTokenDetailsPath(assetId), { state: { backgroundLocation: location } });
  }

  return (
    <Stack data-testid={HomePageSelectors.AssetList} gap="space.05" pb="space.03">
      <AeusdcRetirementCallout />
      {showFirstTokenBanner && <FirstTokenBanner />}
      {!showFirstTokenBanner && <TokensTabHeader />}
      <TokenList filter="enabled" onSelectAsset={handleSelectAsset} showDepositButtons />
      {releaseTrendingTokens && <TrendingTokens onSelectAsset={handleSelectAsset} />}
      <TokensLearn />
      <Outlet />
    </Stack>
  );
}
