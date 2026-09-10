import { useAccountScaledBalanceAnalytics } from '@app/common/app-analytics';
import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import {
  useCurrentAccountLockedBalance,
  useCurrentAccountTotalBalance,
  useCurrentAccountUnlockedBalance,
} from '@app/query/common/account-balance/account-balance.query';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import {
  refreshLeatherTabs,
  useOnFinishedOnboarding,
} from '@app/store/onboarding/onboarding.hooks';
import { useCurrentPolicy, usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { useTogglePrivateMode } from '@app/store/settings/settings.actions';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

export function useHomePageState() {
  const { toggleSwitchAccount } = useSwitchAccountSheet();
  const account = useCurrentStacksAccount();
  const currentAccount = useCurrentAccountId();
  const policy = useCurrentPolicy();
  const isPrivateMode = useIsPrivateMode();
  const togglePrivateMode = useTogglePrivateMode();

  useAccountScaledBalanceAnalytics(currentAccount);
  useOnFinishedOnboarding(() => refreshLeatherTabs());

  const { data: bnsName = '', isFetching } = useAccountDisplayName({
    address: account?.address,
    index: currentAccount.accountIndex || 0,
    fingerprint: currentAccount.fingerprint,
  });

  const policyName = usePolicyDisplayName(policy);
  const name = policyName ?? bnsName;
  const isFetchingBnsName = policy ? false : isFetching;

  const totalBalance = useCurrentAccountTotalBalance();
  const availableBalance = useCurrentAccountUnlockedBalance();
  const lockedBalance = useCurrentAccountLockedBalance();

  return {
    totalBalance,
    availableBalance,
    lockedBalance,
    isFetchingBnsName,
    isPrivateMode,
    name,
    togglePrivateMode,
    toggleSwitchAccount,
  };
}
