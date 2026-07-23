export type SwitchAccountFilter = 'all' | 'bitcoin';

export interface SwitchAccountOutletContext {
  isShowingSwitchAccount: boolean;
  setIsShowingSwitchAccount(isShowing: boolean): void;
  allowPolicyAccounts: boolean;
  setAllowPolicyAccounts(allow: boolean): void;
  accountFilter: SwitchAccountFilter;
  setAccountFilter(filter: SwitchAccountFilter): void;
}
