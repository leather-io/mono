import { Balance } from '@/components/balance/balance';
import { NakedHeader } from '@/components/headers/naked-header';
import { FetchError } from '@/components/loading/error';
import { PageLayout } from '@/components/page/page.layout';
import { AccountOverview } from '@/features/account/components/account-overview-card';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { TokenBalance } from '@/features/balances/token-balance';
import { Collectibles, CollectiblesWidget, hasCollectibles } from '@/features/collectibles';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { AppRoutes } from '@/routes';
import { Account as AccountType } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { router } from 'expo-router';

import { Box, SettingsGearIcon } from '@leather.io/ui/native';

interface AccountProps {
  account: AccountType;
  walletName: string;
  balance: TokenBalance;
  isLoading: boolean;
  isError: boolean;
}

export function Account({ account, walletName, balance, isLoading, isError }: AccountProps) {
  const activity = useAccountActivity(account.fingerprint, account.accountIndex);
  const collectibles = useAccountCollectibles(account.fingerprint, account.accountIndex);
  const releaseCollectibles = useCollectiblesFlag();
  return (
    <PageLayout>
      <NakedHeader
        error={isError && <FetchError />}
        rightElement={
          <Box alignItems="center" flexDirection="row" justifyContent="center" mr="2">
            <NetworkBadge />
            <SettingsGearIcon
              onPress={() => {
                router.navigate({
                  pathname: AppRoutes.SettingsWalletConfigureAccount,
                  params: {
                    fingerprint: account.fingerprint,
                    wallet: account.fingerprint,
                    account: account.accountIndex,
                  },
                });
              }}
            />
          </Box>
        }
      />
      <AccountOverview
        isLoading={isLoading}
        icon={account.icon}
        heading={<Balance balance={balance} variant="heading02" isLoading={isLoading} />}
        accountName={account.name}
        walletName={walletName}
      />
      <BalancesWidget
        onPressHeader={() =>
          router.navigate({
            pathname: AppRoutes.AccountBalances,
            params: { account: account.id, accountId: account.id },
          })
        }
        totalBalance={balance}
        isLoading={isLoading}
        title={t({ id: 'account.balances.header_title', message: 'Tokens' })}
      >
        <AccountBalances
          hardCap
          fingerprint={account.fingerprint}
          accountIndex={account.accountIndex}
        />
      </BalancesWidget>
      <ActivityWidget
        activity={activity}
        onPressHeader={() =>
          router.navigate({
            pathname: AppRoutes.AccountActivity,
            params: { account: account.id, accountId: account.id, accountName: account.name },
          })
        }
        title={t({ id: 'account.activity.header_title', message: 'Activity' })}
      />
      {releaseCollectibles && hasCollectibles(collectibles) && (
        <CollectiblesWidget
          onPressHeader={() =>
            router.navigate({
              pathname: AppRoutes.AccountCollectibles,
              params: { account: account.id, accountId: account.id, accountName: account.name },
            })
          }
          title={t({ id: 'account.collectibles.header_title', message: 'Collectibles' })}
        >
          <Collectibles collectibles={collectibles} />
        </CollectiblesWidget>
      )}
    </PageLayout>
  );
}
