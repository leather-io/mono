import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { useAccountScaledBalanceAnalytics } from '@app/common/app-analytics';
import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import {
  useCurrentAccountAvailableBalance,
  useCurrentAccountTotalBalance,
} from '@app/query/common/account-balance/account-balance.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import {
  refreshLeatherTabs,
  useOnFinishedOnboarding,
} from '@app/store/onboarding/onboarding.hooks';
import { useTogglePrivateMode } from '@app/store/settings/settings.actions';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

export function useHomePageState() {
  const { decodedAuthRequest } = useOnboardingState();
  const { toggleSwitchAccount } = useSwitchAccountSheet();
  const navigate = useNavigate();
  const account = useCurrentStacksAccount();
  const currentAccount = useCurrentAccountId();
  const isPrivateMode = useIsPrivateMode();
  const togglePrivateMode = useTogglePrivateMode();

  useAccountScaledBalanceAnalytics(currentAccount);
  useOnFinishedOnboarding(() => refreshLeatherTabs());

  const { data: name = '', isFetching: isFetchingBnsName } = useAccountDisplayName({
    address: account?.address || '',
    index: currentAccount.accountIndex || 0,
    fingerprint: currentAccount.fingerprint,
  });

  const totalBalance = useCurrentAccountTotalBalance();
  const availableBalance = useCurrentAccountAvailableBalance();
  const stxAccountBalance = useStxAccountBalance(currentAccount);

  useOnMount(() => {
    if (decodedAuthRequest) return navigate(RouteUrls.ChooseAccount);
  });

  return {
    totalBalance,
    availableBalance,
    stxAccountBalance,
    isFetchingBnsName,
    isPrivateMode,
    name,
    togglePrivateMode,
    toggleSwitchAccount,
  };
}
