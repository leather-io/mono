import React from 'react';

import { Balance } from '@/components/balance/balance';
import { FetchErrorCallout } from '@/components/error/fetch-error';
import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { RefreshControl, useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { OnChainActivity } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

import { ActivityEmpty } from '../activity/activity-empty';
import { ActivityListItem } from '../activity/activity-list-item';
import { TokenIcon } from '../balances/token-icon';
import { AccountListItem } from './account-list-item';
import { TokenDetails } from './token-details';
import { TokenOverview } from './token-overview';

const scrollViewAdjustmentOffset = 56;

interface TokenProps {
  tokenId: string;
}

// PETE - smart to have a switch here and then seperate files for BTC / STX / Sip10  - same as balances

export function Token({ tokenId }: TokenProps) {
  const { totalBalance } = useTotalBalance();
  const accounts = useAccounts();
  const { i18n } = useLingui();

  // tmp hardcoded network
  const network = 'Bitcoin';

  const activity = useTotalActivity();

  {
    /* < PETE need to determine how to smartly get token balance here.
Should I just make different files for BTC / STX / Sip10 / Runes? 
- could be cleaner and inline with what we do elsewhere

next need to focus on getting accounts containing those tokens

lastly drilling down to account specific tokens
 */
    // check for
    /** @knipignore */
    //  from Edgar wallet balance
    // pass an array of accounts to the query
    // or load all accounts
    // NEXT:
    // Pete restore this code for per waller balances https://github.com/leather-io/mono/pull/1103/files#diff-f5a583c70efd09f559a1089812a0ab37002ba91204f5311c2b1394b3f210fd50
    // check alexs new code for asset data https://github.com/leather-io/mono/pull/1416/files#diff-6c7c265cfd0c8bbe5b4a6a764414e760f836b918b424f87f60272f495f82c6e2
    // TRY make my token component be more re-usable if I can, only grabbing the token ID
    // may need to add detch state to useTotalData object instead, all data cached so not a bit deal
  }

  const { refreshing, onRefresh } = useRefreshHandler();

  const isLoadingTotalBalance = totalBalance.state === 'loading';
  const isErrorTotalBalance = totalBalance.state === 'error';

  const renderListHeader = () => (
    <Box>
      {/* <Box style={{ marginTop: scrollViewAdjustmentOffset }}>
        <AccountAvatar icon={tokenId} />
      </Box> */}

      {/* TOKEN OVERVIEW */}
      <TokenOverview
        isLoading={isLoadingTotalBalance}
        heading={<TokenIcon ticker={tokenId} />}
        availableBalance={
          <Balance
            balance={totalBalance.state === 'success' ? totalBalance.value : undefined}
            variant="label02"
            lineHeight={16}
          />
        }
        quoteBalance={
          <Balance
            balance={totalBalance.state === 'success' ? totalBalance.value : undefined}
            variant="label02"
            lineHeight={16}
            isQuoteCurrency
          />
        }
      />

      {/* TOKEN DETAILS */}
      <TokenDetails
        name="Bitcoin"
        ticker="BTC"
        network="Bitcoin"
        price="$100,000"
        priceChange="10%"
      />

      <Box>
        <Text variant="label03">
          {i18n._({
            id: 'token.details.header_title',
            message: '{network} Details',
            values: { network: network },
          })}
        </Text>
        {/* ACCOUNTS */}
        {accounts.list
          .filter(account => account.status !== 'hidden')
          .map(account => (
            <AccountListItem key={account.id} account={account} />
          ))}
      </Box>

      <Text>{t({ id: 'token.activity.header_title', message: 'Recent activity' })}</Text>
    </Box>
  );

  return (
    <Screen>
      <Screen.Header
        blurOverlay={false}
        topElement={isErrorTotalBalance && <FetchErrorCallout />}
        rightElement={
          <Box alignItems="center" flexDirection="row" justifyContent="center" mr="2">
            <NetworkBadge />
          </Box>
        }
      />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            refreshControl={<RefreshControl progressViewOffset={scrollViewAdjustmentOffset} />}
            style={{ marginTop: -scrollViewAdjustmentOffset }}
            data={
              activity.value.filter(
                activity =>
                  'asset' in activity &&
                  'symbol' in activity.asset &&
                  activity.asset.symbol === tokenId
              ) as OnChainActivity[]
            } // TODO: Unclear why was this cast. Needs clearing up.
            renderItem={({ item }) => <ActivityListItem activity={item} />}
            keyExtractor={(_, index) => `activity.${index}`}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={<ActivityEmpty />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </FetchWrapper>
    </Screen>
  );
}
