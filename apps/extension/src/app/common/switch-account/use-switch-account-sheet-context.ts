import { useOutletContext } from 'react-router';

import type { SwitchAccountOutletContext } from './switch-account';

export function useSwitchAccountSheet() {
  const {
    isShowingSwitchAccount,
    setIsShowingSwitchAccount,
    allowPolicyAccounts,
    setAllowPolicyAccounts,
  } = useOutletContext<SwitchAccountOutletContext>();

  function toggleSwitchAccount() {
    setIsShowingSwitchAccount(!isShowingSwitchAccount);
  }

  return {
    isShowingSwitchAccount,
    setIsShowingSwitchAccount,
    allowPolicyAccounts,
    setAllowPolicyAccounts,
    toggleSwitchAccount,
  };
}
