import { FetchErrorCallout } from '@/components/error/fetch-error';
import { NakedHeader } from '@/components/headers/naked-header';
import { PageLayout } from '@/components/page/page.layout';
import { AccountOverview } from '@/features/account/components/account-overview-card';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { Collectibles, hasCollectibles } from '@/features/collectibles/collectibles';
import { CollectiblesWidget } from '@/features/collectibles/collectibles-widget';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { AccountLookup } from '@/shared/types';
import { Account as AccountType } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { router } from 'expo-router';

import { Box, SettingsGearIcon } from '@leather.io/ui/native';

import { AccountBalance } from '../balances/total-balance';

interface AccountProps extends AccountLookup {
  account: AccountType;
  walletName: string;
}

export function Account({ account, walletName }: AccountProps) {
  const { fingerprint, accountIndex, id, name, icon } = account;
  const { totalBalance } = useAccountBalance({
    fingerprint,
    accountIndex,
  });

  const activity = useAccountActivity(fingerprint, accountIndex);
  const collectibles = useAccountCollectibles(fingerprint, accountIndex);
  const releaseCollectibles = useCollectiblesFlag();

  const isLoadingTotalBalance = totalBalance.state === 'loading';
  const isErrorTotalBalance = totalBalance.state === 'error';
  return (
    <PageLayout>
      <NakedHeader
        error={isErrorTotalBalance && <FetchErrorCallout />}
        rightElement={
          <Box alignItems="center" flexDirection="row" justifyContent="center" mr="2">
            <NetworkBadge />
            <SettingsGearIcon
              onPress={() => {
                router.navigate({
                  pathname: '/settings/wallet/configure/[wallet]/[account]',
                  params: {
                    fingerprint: fingerprint,
                    wallet: fingerprint,
                    account: accountIndex,
                  },
                });
              }}
            />
          </Box>
        }
      />
      <AccountOverview
        isLoading={isLoadingTotalBalance}
        icon={icon}
        heading={
          <AccountBalance
            fingerprint={fingerprint}
            accountIndex={accountIndex}
            variant="heading02"
          />
        }
        accountName={name}
        walletName={walletName}
      />
      <Box gap="8">
        <BalancesWidget
          onPressHeader={() =>
            router.navigate({
              pathname: '/account/[accountId]/balances',
              params: { accountId: id },
            })
          }
          balance={
            <AccountBalance
              fingerprint={fingerprint}
              accountIndex={accountIndex}
              color="ink.text-subdued"
            />
          }
          title={t({ id: 'account.balances.header_title', message: 'Tokens' })}
        >
          <AccountBalances mode="widget" fingerprint={fingerprint} accountIndex={accountIndex} />
        </BalancesWidget>
        <ActivityWidget
          activity={activity}
          onPressHeader={() =>
            router.navigate({
              pathname: '/account/[accountId]/activity',
              params: { accountId: id, accountName: name },
            })
          }
          title={t({ id: 'account.activity.header_title', message: 'Activity' })}
        />
        {releaseCollectibles && hasCollectibles(collectibles) && (
          <CollectiblesWidget
            onPressHeader={() =>
              router.navigate({
                pathname: '/account/[accountId]/collectibles',
                params: { accountId: id, accountName: name },
              })
            }
            title={t({ id: 'account.collectibles.header_title', message: 'Collectibles' })}
          >
            <Collectibles collectibles={collectibles} mode="widget" />
          </CollectiblesWidget>
        )}
      </Box>
    </PageLayout>
  );
}
