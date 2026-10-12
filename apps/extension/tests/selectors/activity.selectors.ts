export const ActivitySelectors = {
  ActivityList: 'activity-list',
  ActivityItemMenu: 'activity-item-menu',
  ActivityItemMenuBtn: 'activity-item-menu-btn',
  ActivityItemMenuIncreaseFee: 'activity-item-menu-increase-fee',
  ActivityItemMenuCancelTransaction: 'activity-item-menu-cancel-transaction',

  TransactionActionFeeInput: 'transaction-action-fee-input',
  TransactionActionSheet: 'transaction-action-sheet',
  TransactionSubmitAction: 'transaction-submit-action',
} as const;
export type ActivitySelectors = (typeof ActivitySelectors)[keyof typeof ActivitySelectors];
