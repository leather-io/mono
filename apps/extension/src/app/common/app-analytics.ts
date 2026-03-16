import { useEffect } from 'react';

import { z } from 'zod';

import { makeAccountIdentifer } from '@leather.io/crypto';
import {
  type AccountId,
  HIRO_API_BASE_URL_MAINNET,
  HIRO_API_BASE_URL_TESTNET,
  Money,
} from '@leather.io/models';
import { convertAmountToBaseUnit, isDefined, scaleValue } from '@leather.io/utils';

import { IS_TEST_ENV, MIXPANEL_TOKEN } from '@shared/environment';
import {
  analytics,
  decorateAnalyticsEventsWithContext,
  initAnalytics,
} from '@shared/utils/analytics';

import { useBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useAccountTotalBalance } from '@app/query/common/account-balance/account-balance.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { store } from '@app/store';
import { selectActiveWalletType } from '@app/store/common/wallet-type.selectors';
import { selectCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useOnMount } from './hooks/use-on-mount';
import { flow, origin } from './initial-search-params';

const defaultStaticAnalyticContext = {
  ip: '0.0.0.0',
  platform: 'extension',
  version: VERSION,
  ...(flow && { flow }),
  ...(origin && { origin }),
};

function getAnalyticsStateProps() {
  const state = store.getState();
  const currentNetwork = selectCurrentNetwork(state);
  const walletType = selectActiveWalletType(state);

  return {
    walletType,
    currentNetwork,
  };
}

function isHiroApiUrl(url: string) {
  return url.includes(HIRO_API_BASE_URL_MAINNET) || url.includes(HIRO_API_BASE_URL_TESTNET);
}

function getDerivedStateAnalyticsContext() {
  const appState = getAnalyticsStateProps();

  return {
    route: location.pathname,
    network: appState.currentNetwork.name.toLowerCase(),
    usingDefaultHiroApi: isHiroApiUrl(appState.currentNetwork.chain.stacks.url),
    walletType: appState.walletType,
  };
}

export function initalizeAnalytics() {
  if (!MIXPANEL_TOKEN || IS_TEST_ENV) return;
  initAnalytics();
  decorateAnalyticsEventsWithContext(() => ({
    ...defaultStaticAnalyticContext,
    ...getDerivedStateAnalyticsContext(),
  }));
}

const analyticsQueueItemSchema = z.object({
  eventName: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const analyticsQueueSchema = z.array(analyticsQueueItemSchema);

const analyticsEventKey = 'backgroundAnalyticsRequests';

export function useHandleQueuedBackgroundAnalytics() {
  useOnMount(() => {
    async function handleQueuedAnalytics() {
      const queuedEventsStore = await chrome.storage.local.get(analyticsEventKey);

      try {
        const events = analyticsQueueSchema.parse(queuedEventsStore[analyticsEventKey] ?? []);
        if (!events.length) return;
        await chrome.storage.local.remove(analyticsEventKey);
        events.forEach(({ eventName, properties }) =>
          analytics.untypedTrack(eventName, properties)
        );
      } catch {
        analytics.track('background_analytics_schema_fail');
      }
    }
    void handleQueuedAnalytics();
  });
}

export function useAccountScaledBalanceAnalytics(accountId: AccountId) {
  const btcBalance = useBtcAccountBalance(accountId);
  const stxBalance = useStxAccountBalance(accountId);

  const totalBalance = useAccountTotalBalance(accountId);
  function getScaledValueFromMoney(money: Money | undefined) {
    return money ? scaleValue(Number(convertAmountToBaseUnit(money))) : undefined;
  }
  const scaledStxAvailableBalance = getScaledValueFromMoney(
    stxBalance.value?.stx.availableUnlockedBalance
  );
  const scaledStxLockedBalance = getScaledValueFromMoney(stxBalance.value?.stx.lockedBalance);
  const scaledBtcAvailableBalance = getScaledValueFromMoney(btcBalance.value?.btc.availableBalance);
  const scaledUsdBalance = getScaledValueFromMoney(totalBalance.value);

  useEffect(() => {
    if (
      isDefined(scaledStxAvailableBalance) &&
      isDefined(scaledStxLockedBalance) &&
      isDefined(scaledUsdBalance) &&
      isDefined(scaledBtcAvailableBalance) &&
      isDefined(accountId)
    ) {
      analytics.track('balance_updated', {
        platform: 'extension',
        walletAccountId: makeAccountIdentifer(accountId.fingerprint, accountId.accountIndex),
        stxAvailableBalance: scaledStxAvailableBalance,
        stxLockedBalance: scaledStxLockedBalance,
        usdBalance: scaledUsdBalance,
        btcBalance: scaledBtcAvailableBalance,
      });
    }
  }, [
    accountId,
    scaledBtcAvailableBalance,
    scaledStxAvailableBalance,
    scaledStxLockedBalance,
    scaledUsdBalance,
  ]);
}
