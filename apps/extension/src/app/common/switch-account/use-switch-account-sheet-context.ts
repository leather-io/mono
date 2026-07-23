import { useOutletContext } from 'react-router';

import type { SwitchAccountOutletContext } from './switch-account';

export function useSwitchAccountSheet() {
  const {
    isShowingSwitchAccount,
    setIsShowingSwitchAccount,
    allowPolicyAccounts,
    setAllowPolicyAccounts,
    accountFilter,
    setAccountFilter,
  } = useOutletContext<SwitchAccountOutletContext>();

  return {
    isShowingSwitchAccount,
    setIsShowingSwitchAccount,
    allowPolicyAccounts,
    setAllowPolicyAccounts,
    accountFilter,
    setAccountFilter,
    toggleSwitchAccount() {
      setIsShowingSwitchAccount(!isShowingSwitchAccount);
    },
  };
}
