import { formatCurrency } from '@app/common/currency-formatter';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { useFlags } from '@app/features/feature-flags';
import { AccountCard as AccountCardCurrent } from '@app/ui/components/account/account-current.card';
import { AccountCard as AccountCardLegacy } from '@app/ui/components/account/account.card';

import { useHomePageState } from '../use-home-page-state';
import { AccountActionsSwitch } from './account-actions-switch';

export function AccountCardSwitch() {
  const { accountRevamp } = useFlags();
  const {
    totalBalance,
    availableBalance,
    stxAccountBalance,
    isFetchingBnsName,
    isPrivateMode,
    name,
    togglePrivateMode,
    toggleSwitchAccount,
  } = useHomePageState();

  const isLoadingBalance = totalBalance.state === 'loading' || availableBalance.state === 'loading';

  if (accountRevamp) {
    return (
      <AccountCardCurrent
        totalBalance={
          totalBalance.state !== 'success'
            ? emptyAmountPlaceholder
            : formatCurrency(totalBalance.value)
        }
        lockedBalanceMoney={stxAccountBalance.value?.quote.lockedBalance}
        totalBalanceMoney={totalBalance.value}
        isLoadingBalance={isLoadingBalance}
        isLoadingAdditionalData={isLoadingBalance}
        isBalancePrivate={isPrivateMode}
        onShowBalance={togglePrivateMode}
      />
    );
  }

  return (
    <AccountCardLegacy
      name={name}
      availableBalance={
        availableBalance.state !== 'success'
          ? emptyAmountPlaceholder
          : formatCurrency(availableBalance.value)
      }
      totalBalance={
        totalBalance.state !== 'success'
          ? emptyAmountPlaceholder
          : formatCurrency(totalBalance.value)
      }
      toggleSwitchAccount={() => toggleSwitchAccount()}
      isFetchingBnsName={isFetchingBnsName}
      isLoadingBalance={isLoadingBalance}
      isLoadingAdditionalData={isLoadingBalance}
      isBalancePrivate={isPrivateMode}
      onShowBalance={togglePrivateMode}
    >
      <AccountActionsSwitch />
    </AccountCardLegacy>
  );
}
