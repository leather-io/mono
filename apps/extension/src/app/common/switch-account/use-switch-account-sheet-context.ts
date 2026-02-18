import { createContext, useContext } from 'react';

import type { SwitchAccountOutletContext } from './switch-account';

const switchAccountSheetContext = createContext<SwitchAccountOutletContext | null>(null);

export const SwitchAccountSheetProvider = switchAccountSheetContext.Provider;

export function useSwitchAccountSheet() {
  const context = useContext(switchAccountSheetContext);
  if (!context)
    throw new Error('useSwitchAccountSheet must be used within SwitchAccountSheetProvider');

  const { isShowingSwitchAccount, setIsShowingSwitchAccount } = context;

  return {
    isShowingSwitchAccount,
    setIsShowingSwitchAccount,
    toggleSwitchAccount() {
      setIsShowingSwitchAccount(!isShowingSwitchAccount);
    },
  };
}
