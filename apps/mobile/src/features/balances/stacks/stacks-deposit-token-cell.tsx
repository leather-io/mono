import { DepositTokenCell } from '@/features/token/components/deposit-token-cell';
import { useActivityByAsset } from '@/queries/activity/activity.query';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';

import { stxAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui/native';

export function StacksDepositTokenCell({ accountIndex, fingerprint }: AccountId) {
  const { state: balanceState, value: balanceValue } = useStxAccountBalance(
    fingerprint,
    accountIndex
  );
  const { state: activityState, value: activityValue } = useActivityByAsset(
    fingerprint,
    accountIndex,
    stxAsset
  );

  return (
    <DepositTokenCell
      ticker="STX"
      icon={<StxAvatarIcon indicator={<StacksFilledCircleIcon variant="small" />} />}
      tokenName={t`Stacks`}
      availableBalance={balanceValue?.stx.availableUnlockedBalance}
      quoteBalance={balanceValue?.quote.availableUnlockedBalance}
      isBalanceLoading={balanceState === 'loading'}
      isActivityLoading={activityState === 'loading'}
      hasActivity={!!activityValue?.length}
      asset={stxAsset}
    />
  );
}
