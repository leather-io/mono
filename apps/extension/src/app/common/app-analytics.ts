import { useEffect, useRef } from 'react';

import { z } from 'zod';

import { makeAccountIdentifer } from '@leather.io/crypto';
import {
  type CryptoAssetProtocol,
  HIRO_API_BASE_URL_MAINNET,
  HIRO_API_BASE_URL_TESTNET,
  type Money,
} from '@leather.io/models';
import { convertAmountToBaseUnit, isDefined, scaleValue, toHexString } from '@leather.io/utils';

import { IS_TEST_ENV, MIXPANEL_TOKEN } from '@shared/environment';
import {
  analytics,
  decorateAnalyticsEventsWithContext,
  initAnalytics,
} from '@shared/utils/analytics';

import { useBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountTotalBalance } from '@app/query/common/account-balance/account-balance.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
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

function getScaledValueFromMoney(money: Money | undefined) {
  return money ? scaleValue(Number(convertAmountToBaseUnit(money))) : undefined;
}

export function useAccountScaledBalanceAnalytics({ accountIndex }: { accountIndex: number }) {
  const btcBalance = useBtcAccountBalance(accountIndex);
  const stxBalance = useStxAccountBalance(accountIndex);

  const totalBalance = useAccountTotalBalance(accountIndex);
  const scaledStxAvailableBalance = getScaledValueFromMoney(
    stxBalance.value?.stx.availableUnlockedBalance
  );
  const scaledStxLockedBalance = getScaledValueFromMoney(stxBalance.value?.stx.lockedBalance);
  const scaledBtcAvailableBalance = getScaledValueFromMoney(btcBalance.value?.btc.availableBalance);
  const scaledUsdBalance = getScaledValueFromMoney(totalBalance.value);

  const fingerprint = useWalletFingerprint();

  const accountId = fingerprint
    ? // FIXME: using unpadded fingerprint here
      makeAccountIdentifer(toHexString(fingerprint), accountIndex)
    : undefined;

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

export function useCollectiblesAnalytics({ accountIndex }: { accountIndex: number }) {
  const account = useAccountAddresses(accountIndex);
  const { data: collectibles = [], isPending } = useAccountCollectibles(account);
  const fingerprint = useWalletFingerprint();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (isPending || hasTracked.current || collectibles.length === 0) return;
    hasTracked.current = true;

    const byProtocol = collectibles.reduce<Partial<Record<CryptoAssetProtocol, { total: number }>>>(
      (acc, view) => {
        const protocol = view.asset.protocol;
        acc[protocol] = { total: (acc[protocol]?.total ?? 0) + 1 };
        return acc;
      },
      {}
    );

    const walletAccountId = fingerprint
      ? makeAccountIdentifer(toHexString(fingerprint), accountIndex)
      : undefined;

    analytics.track('collectibles_summary', {
      walletAccountId: walletAccountId ?? '',
      platform: 'extension',
      totalCollectibles: collectibles.length,
      byProtocol,
    });
  }, [isPending, collectibles, fingerprint, accountIndex]);
}

export function useTokenPortfolioAnalytics({ accountIndex }: { accountIndex: number }) {
  const sip10Balance = useSip10AccountBalance(accountIndex);
  const runesBalance = useRunesAccountBalance(accountIndex);
  const fingerprint = useWalletFingerprint();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    if (sip10Balance.state !== 'success' || runesBalance.state !== 'success') return;
    if (!fingerprint) return;
    hasTracked.current = true;

    const sip10TokenCount = sip10Balance.value.sip10s.length;
    const runeTokenCount = runesBalance.value.runes.length;
    const sip10TokenValue = getScaledValueFromMoney(sip10Balance.value.quote.availableBalance) ?? 0;
    const runeTokenValue = getScaledValueFromMoney(runesBalance.value.quote.availableBalance) ?? 0;

    const walletAccountId = makeAccountIdentifer(toHexString(fingerprint), accountIndex);

    analytics.track('token_portfolio_summary', {
      walletAccountId,
      platform: 'extension',
      sip10TokenCount,
      runeTokenCount,
      totalTokenCount: sip10TokenCount + runeTokenCount,
      sip10TokenValue,
      runeTokenValue,
      totalTokenValue: sip10TokenValue + runeTokenValue,
    });
  }, [sip10Balance, runesBalance, fingerprint, accountIndex]);
}

export function useTokenDetailsTracking({
  accountIndex,
  assetId,
  protocol,
}: {
  accountIndex: number;
  assetId: string;
  protocol: CryptoAssetProtocol;
}) {
  const fingerprint = useWalletFingerprint();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current || !fingerprint || !assetId) return;
    hasTracked.current = true;

    const walletAccountId = makeAccountIdentifer(toHexString(fingerprint), accountIndex);

    analytics.track('token_details_viewed', {
      assetId,
      protocol,
      platform: 'extension',
      walletAccountId,
    });
  }, [fingerprint, assetId, protocol, accountIndex]);
}
