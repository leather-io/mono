export const SharedComponentsSelectors = {
  // AddressDisplayer
  AddressDisplayer: 'address-displayer',
  AddressDisplayerPart: 'address-displayer-part',

  // AccountCard
  AccountCardBalanceText: 'account-card-balance-text',
  CardAvailableBalance: 'card-available-balance',

  // InfoCard
  InfoCardAssetValue: 'info-card-asset-value',
  InfoCardRowValue: 'info-card-row-value',
  InfoCardButton: 'info-card-button',

  // Fees
  FeeRow: 'fee-row',
  CustomFeeFieldInput: 'custom-fee-field-input',
  CustomFeeSelectItem: 'custom-fee',
  FeeEstimateSelect: 'fee-estimate-select',
  FeeToBePaidLabel: 'fee-to-be-paid-label',
  LowFeeEstimateItem: 'low-fee',
  MiddleFeeEstimateItem: 'standard-fee',
  FeesListItem: 'fee-list-item',
  FeesListItemFeeValue: 'fee-list-item-fee-value',

  // Error
  BroadcastErrorTitle: 'broadcast-error-title',
  HeaderBackBtn: 'header-back-button',
  HeaderCloseBtn: 'header-close-button',

  // FeatureIntroducer
  FeatureIntroducerCloseBtn: 'feature-introducer-close-btn',
  FeatureIntroducerTryItOutBtn: 'feature-introducer-try-it-out-btn',
} as const;
export type SharedComponentsSelectors =
  (typeof SharedComponentsSelectors)[keyof typeof SharedComponentsSelectors];
