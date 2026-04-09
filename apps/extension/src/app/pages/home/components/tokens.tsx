import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Stack } from 'leather-styles/jsx';

import { createTokenDetailsPath } from '@leather.io/features';
import { Callout } from '@leather.io/ui';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { TokenList } from '@app/features/asset-list/token-list';
import { useFlags } from '@app/features/feature-flags';
import { TrendingTokens } from '@app/features/trending-tokens/trending-tokens';
import { useActivity } from '@app/query/activity/activity.query';
import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { FirstTokenBanner } from './first-token-banner';
import { TokensLearn } from './tokens-learn';
import { TokensTabHeader } from './tokens-tab-header';

export function Tokens() {
  const navigate = useNavigate();
  const location = useLocation();
  const { releaseTrendingTokens } = useFlags();
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);
  const activityQuery = useActivity(account);
  const showFirstTokenBanner = activityQuery.isSuccess && !activityQuery.data?.length;

  const runes = useRunesAccountBalance(accountId);
  const collectiblesQuery = useAccountCollectibles(account);
  const balancesLoaded = runes.state === 'success' && collectiblesQuery.isSuccess;
  const hasRunes = runes.value?.runes && runes.value.runes.length > 0;
  const hasOrdinals =
    collectiblesQuery.data?.some(c => c.asset.protocol === 'inscription') ?? false;
  const isSunsetAffected = hasRunes || hasOrdinals;

  function handleSelectAsset(assetId: SerializedCryptoAssetId) {
    void navigate(createTokenDetailsPath(assetId), { state: { backgroundLocation: location } });
  }

  return (
    <Stack data-testid={HomePageSelectors.AssetList} gap="space.05" pb="space.03">
      <Callout variant="warning" title="Leather is sunsetting Ordinals, Runes, and BRC-20">
        Runes and BRC-20 support ends April 16. Ordinals support ends May 16. Please transfer these
        assets to another wallet before the deadline.
        {balancesLoaded && (
          <>
            <br />
            {isSunsetAffected
              ? 'This change is going to affect this account.'
              : 'This change is not going to affect this account.'}
          </>
        )}
      </Callout>
      {showFirstTokenBanner && <FirstTokenBanner />}
      {!showFirstTokenBanner && <TokensTabHeader />}
      <TokenList filter="enabled" onSelectAsset={handleSelectAsset} showDepositButtons />
      {releaseTrendingTokens && <TrendingTokens onSelectAsset={handleSelectAsset} />}
      <TokensLearn />
      <Outlet />
    </Stack>
  );
}
