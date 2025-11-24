import { useEffect } from 'react';

import { z } from 'zod';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { HIRO_API_BASE_URL_MAINNET, HIRO_API_BASE_URL_TESTNET, Money } from '@leather.io/models';
import { convertAmountToBaseUnit, isDefined, scaleValue, toHexString } from '@leather.io/utils';

import { IS_TEST_ENV, SEGMENT_WRITE_KEY } from '@shared/environment';
import {
  analytics,
  decorateAnalyticsEventsWithContext,
  initAnalytics,
} from '@shared/utils/analytics';

import { useNativeSegwitBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useAccountTotalBalance } from '@app/query/common/account-balance/account-balance.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { store } from '@app/store';
import { selectWalletType } from '@app/store/common/wallet-type.selectors';
import { useWalletFingerprint } from '@app/store/in-memory-key/in-memory-key.hooks';
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
  const walletType = selectWalletType(state);

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

export function useInitalizeAnalytics() {
  useEffect(() => {
    if (!SEGMENT_WRITE_KEY || IS_TEST_ENV) return;
    initAnalytics();
  }, []);
}

decorateAnalyticsEventsWithContext(() => ({
  ...defaultStaticAnalyticContext,
  ...getDerivedStateAnalyticsContext(),
}));

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
        await Promise.all(
          events.map(({ eventName, properties }) => analytics.untypedTrack(eventName, properties))
        );
      } catch {
        void analytics.track('background_analytics_schema_fail');
      }
    }
    void handleQueuedAnalytics();
  });
}

export function useAccountScaledBalanceAnalytics({ accountIndex }: { accountIndex: number }) {
  const btcBalance = useNativeSegwitBtcAccountBalance(accountIndex);
  const stxBalance = useStxAccountBalance(accountIndex);

  const totalBalance = useAccountTotalBalance(accountIndex);
  function getScaledValueFromMoney(money: Money | undefined) {
    return money ? scaleValue(Number(convertAmountToBaseUnit(money))) : undefined;
  }
  const scaledStxAvailableBalance = getScaledValueFromMoney(
    stxBalance.value?.stx.availableUnlockedBalance
  );
  const scaledStxLockedBalance = getScaledValueFromMoney(stxBalance.value?.stx.lockedBalance);
  const scaledBtcAvailableBalance = getScaledValueFromMoney(btcBalance.value?.btc.availableBalance);
  const scaledUsdBalance = getScaledValueFromMoney(totalBalance.value);

  const fingerprint = useWalletFingerprint();

  const accountId = fingerprint
    ? makeAccountIdentifer(toHexString(fingerprint), accountIndex)
    : undefined;

  useEffect(() => {
    if (
      isDefined(scaledStxAvailableBalance) &&
      isDefined(scaledStxLockedBalance) &&
      isDefined(scaledUsdBalance) &&
      isDefined(scaledBtcAvailableBalance) &&
      isDefined(accountId)
    ) {
      void analytics.track('balance_updated', {
        platform: 'extension',
        walletAccountId: accountId,
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
