export const BondsSelectors = {
  LockedBalanceCard: 'locked-balance-card',
  BondCallout: 'bond-callout',
  BondCalloutPrimaryAction: 'bond-callout-primary-action',
  BondCalloutDismiss: 'bond-callout-dismiss',
  BalanceRowStxInBond: 'balance-row-stx-in-bond',
  DetailRenewalRow: 'all-balances-detail-renewal-row',
  DetailError: 'all-balances-detail-error',
} as const;
export type BondsSelectors = (typeof BondsSelectors)[keyof typeof BondsSelectors];
