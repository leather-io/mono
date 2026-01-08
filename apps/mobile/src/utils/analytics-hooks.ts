import { useEffect } from 'react';

import { useAccountTotalBalance } from '@/queries/balance/account-balance.query';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { analytics } from '@/utils/analytics';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId, Money, NonFungibleCryptoAsset } from '@leather.io/models';
import { type RuneBalance, type Sip10Balance } from '@leather.io/services';
import { convertAmountToBaseUnit, isDefined, scaleValue } from '@leather.io/utils';

function getScaledValueFromMoney(money: Money | undefined) {
  return money ? scaleValue(Number(convertAmountToBaseUnit(money))) : undefined;
}

export function useAccountScaledBalanceAnalytics({
  currentAccount,
}: {
  currentAccount: AccountId;
}) {
  const { fingerprint, accountIndex } = currentAccount;
  const accountId = makeAccountIdentifer(fingerprint, accountIndex);
  const btcBalance = useBtcAccountBalance(fingerprint, accountIndex);
  const stxBalance = useStxAccountBalance(fingerprint, accountIndex);

  // Always pull the data in usd here
  const totalBalance = useAccountTotalBalance(
    {
      fingerprint: currentAccount.fingerprint,
      accountIndex: currentAccount.accountIndex,
    },
    'USD'
  );
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
      isDefined(scaledBtcAvailableBalance)
    ) {
      analytics.track('balance_updated', {
        platform: 'mobile',
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

export function useTokenPortfolioAnalytics({
  currentAccount,
  sip10Balance,
  runeBalance,
}: {
  currentAccount: AccountId;
  sip10Balance: Sip10Balance[];
  runeBalance: RuneBalance[];
}) {
  const { fingerprint, accountIndex } = currentAccount;
  const accountId = makeAccountIdentifer(fingerprint, accountIndex);

  useEffect(() => {
    if (!sip10Balance.length || !runeBalance.length) return;
    const sip10Value = getScaledValueFromMoney(sip10Balance[0]?.quote.availableBalance);
    const runeValue = getScaledValueFromMoney(runeBalance[0]?.quote.availableBalance);
    const sip10TokenCount = sip10Balance.length;
    const runeTokenCount = runeBalance.length;
    const fiatCurrency = sip10Balance[0]?.quote.availableBalance?.symbol;
    analytics.track('token_portfolio_summary', {
      platform: 'mobile',
      walletAccountId: accountId,
      sip10TokenCount,
      runeTokenCount,
      totalTokenCount: sip10TokenCount + runeTokenCount,
      sip10TokenValue: sip10Value ?? 0,
      runeTokenValue: runeValue ?? 0,
      totalTokenValue: (sip10Value ?? 0) + (runeValue ?? 0),
      fiatCurrency,
    });
  }, [accountId, runeBalance, sip10Balance]);
}

export function useCollectiblesAnalytics({
  currentAccount,
  collectibles,
}: {
  currentAccount: AccountId;
  collectibles: NonFungibleCryptoAsset[];
}) {
  const { fingerprint, accountIndex } = currentAccount;
  const accountId = makeAccountIdentifer(fingerprint, accountIndex);

  useEffect(() => {
    if (!collectibles.length) return;

    type ProtocolKey = NonFungibleCryptoAsset['protocol'];
    interface ProtocolBreakdown {
      total: number;
      byContentType: Record<string, number>;
    }
    const breakdown: Partial<Record<ProtocolKey, ProtocolBreakdown>> = {};

    collectibles.forEach(collectible => {
      const protocol = collectible.protocol;
      const entry =
        breakdown[protocol] ??
        (breakdown[protocol] = {
          total: 0,
          byContentType: {},
        });

      entry.total += 1;

      function getContentType() {
        if ('mimeType' in collectible && collectible.mimeType) {
          return collectible.mimeType;
        }
        if ('content' in collectible && collectible.content?.contentType) {
          return collectible.content.contentType;
        }
        return;
      }
      const contentType = getContentType();

      if (contentType) {
        entry.byContentType[contentType] = (entry.byContentType[contentType] ?? 0) + 1;
      }
    });

    const formattedBreakdown = Object.entries(breakdown).reduce<
      Partial<Record<ProtocolKey, { total: number; byContentType?: Record<string, number> }>>
    >((acc, [protocol, data]) => {
      if (!data) return acc;
      const { total, byContentType } = data;
      acc[protocol as ProtocolKey] = {
        total,
        ...(Object.keys(byContentType).length ? { byContentType } : {}),
      };
      return acc;
    }, {});

    analytics.track('collectibles_summary', {
      platform: 'mobile',
      walletAccountId: accountId,
      totalCollectibles: collectibles.length,
      byProtocol: formattedBreakdown,
    });
  }, [accountId, collectibles]);
}
