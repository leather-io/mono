export const OnChainActivityTypes = {
  deploySmartContract: 'deploySmartContract',
  executeSmartContract: 'executeSmartContract',
  lockAsset: 'lockAsset',
  sendAsset: 'sendAsset',
  receiveAsset: 'receiveAsset',
  swapAssets: 'swapAssets',
} as const;
export type OnChainActivityType = keyof typeof OnChainActivityTypes;

export const WalletActivityTypes = {
  connectApp: 'connectApp',
  signMessage: 'signMessage',
} as const;
export type WalletActivityType = keyof typeof WalletActivityTypes;

export const GeneralActivityTypes = {
  walletAdded: 'walletAdded',
  receiveAnnouncement: 'receiveAnnouncement',
  featureWaitlistNotification: 'featureWaitlistNotification',
} as const;
export type GeneralActivityType = keyof typeof GeneralActivityTypes;

export type ActivityType = OnChainActivityType | WalletActivityType | GeneralActivityType;
