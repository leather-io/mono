export const FundPageSelectors = {
  BtnReceiveStx: 'btn-receive-stx',
  FiatProviderItem: 'fiat-provider-item',
  FiatProviderName: 'fiat-provider-name',
} as const;
export type FundPageSelectors = (typeof FundPageSelectors)[keyof typeof FundPageSelectors];
