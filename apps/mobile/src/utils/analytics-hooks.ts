import { useEffect } from 'react';

import { useAccountTotalBalance } from '@/queries/balance/account-balance.query';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { analytics } from '@/utils/analytics';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId, Money } from '@leather.io/models';
import { convertAmountToBaseUnit, isDefined, scaleValue } from '@leather.io/utils';

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
      isDefined(scaledBtcAvailableBalance)
    ) {
      void analytics.track('balance_updated', {
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
