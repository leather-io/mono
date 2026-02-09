import { DepositTokenCell } from '@/features/token/components/deposit-token-cell';
import { useActivityByAsset } from '@/queries/activity/activity.query';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';

import { btcAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { BitcoinFilledCircleIcon, BtcAvatarIcon } from '@leather.io/ui/native';

export function BitcoinDepositTokenCell({ accountIndex, fingerprint }: AccountId) {
  const { state: balanceState, value: balanceValue } = useBtcAccountBalance(
    fingerprint,
    accountIndex
  );
  const { state: activityState, value: activityValue } = useActivityByAsset(
    fingerprint,
    accountIndex,
    btcAsset
  );

  return (
    <DepositTokenCell
      ticker="BTC"
      icon={<BtcAvatarIcon indicator={<BitcoinFilledCircleIcon variant="small" />} />}
      tokenName={t`Bitcoin`}
      availableBalance={balanceValue?.btc.availableBalance}
      quoteBalance={balanceValue?.quote.availableBalance}
      isBalanceLoading={balanceState === 'loading'}
      isActivityLoading={activityState === 'loading'}
      hasActivity={!!activityValue?.length}
      asset={btcAsset}
    />
  );
}
