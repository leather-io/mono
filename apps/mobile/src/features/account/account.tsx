import { NakedHeader } from '@/components/headers/naked-header';
import { FetchError } from '@/components/loading/error';
import { PageLayout } from '@/components/page/page.layout';
import { AccountOverview } from '@/features/account/components/account-overview-card';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { Collectibles, CollectiblesWidget, hasCollectibles } from '@/features/collectibles';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { AppRoutes } from '@/routes';
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
        error={isErrorTotalBalance && <FetchError />}
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
        isLoading={isLoadingTotalBalance}
        icon={icon}
        balance={
          <AccountBalance
            fingerprint={fingerprint}
            accountIndex={accountIndex}
            variant="heading02"
          />
        }
        accountName={name}
        walletName={walletName}
      />
      <BalancesWidget
        onPressHeader={() =>
          router.navigate({
            pathname: AppRoutes.AccountBalances,
            params: { account: account.id, accountId: account.id },})
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
        <AccountBalances hardCap fingerprint={fingerprint} accountIndex={accountIndex} />
      </BalancesWidget>
      <ActivityWidget
        activity={activity}
        onPressHeader={() =>
          router.navigate({
            pathname: AppRoutes.AccountActivity,
<<<<<<< HEAD
            params: { account: account.id, accountId: account.id, accountName: account.name },
=======
            params: { accountId: id, accountName: name },
>>>>>>> 9e285002 (refactor(mobile): refactor Balance component to avoid repetition, ref LEA-1726)
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
          title={t({ id: 'collectibles.header_title', message: 'Collectibles' })}
        >
          <Collectibles collectibles={collectibles} />
        </CollectiblesWidget>
      )}
    </PageLayout>
  );
}
