import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { FetchErrorCallout } from '@/components/error/fetch-error';
import { Screen } from '@/components/screen/screen';
import { HeaderBlurOverlay } from '@/components/screen/screen-header/components/header-blur-overlay';
import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountOverview } from '@/features/account/components/account-overview-card';
import { ActivityWidget } from '@/features/activity/activity-widget';
import { AccountBalances } from '@/features/balances/balances';
import { BalancesWidget } from '@/features/balances/balances-widget';
import { Collectibles, CollectiblesWidget, hasCollectibles } from '@/features/collectibles';
import { useCollectiblesFlag } from '@/features/feature-flags';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
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

const scrollViewAdjustmentOffset = 56;

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
    <Screen>
      <Screen.Header
        blurOverlay={false}
        topElement={isErrorTotalBalance && <FetchErrorCallout />}
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
      <Screen.ScrollView
        refreshControl={<RefreshControl progressViewOffset={scrollViewAdjustmentOffset} />}
        style={{ marginTop: -scrollViewAdjustmentOffset }}
        stickyHeaderIndices={[0]}
      >
        <Box style={{ marginTop: scrollViewAdjustmentOffset }}>
          <StickyHeader icon={icon} />
        </Box>
        <AccountOverview
          isLoading={isLoadingTotalBalance}
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
      </Screen.ScrollView>
    </Screen>
  );
}

interface StickerHeaderProps {
  icon: string;
}

function StickyHeader({ icon }: StickerHeaderProps) {
  const { scrollY } = useScreenScrollContext();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(scrollY.value, [36, 50], [1, 0.8], 'clamp') }],
    };
  });

  return (
    <>
      <Box alignItems="center" pb="3" mb="-3" backgroundColor="ink.background-primary">
        <Animated.View style={animatedStyle}>
          <AccountAvatar icon={icon} />
        </Animated.View>
      </Box>
      <Box top={12}>
        <HeaderBlurOverlay scrollY={scrollY} />
      </Box>
    </>
  );
}
