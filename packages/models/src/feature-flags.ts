export interface FeatureFlags {
  releaseOnramperBuy: boolean;
  extensionRevamp: boolean;
  releaseBrowserFeature: boolean;
  releaseCollectiblesFeature: boolean;
  collectibleDetails: boolean;
  releasePushNotifications: boolean;
  releaseWaitlistFeatures: boolean;
  releaseDynamicFeeFeature: boolean;
  releaseEarnFeature: boolean;
  releaseDappSuggestionsFeature: boolean;
  releaseSip10SendFeature: boolean;
  sendPasteButton: boolean;
  tokenDetails: boolean;
  minimumAppVersion: string;
  releaseBtcConversionUnitFeature: boolean;
  internationalization: boolean;
  releaseTokenManagement: boolean;
  swap: boolean;
  releaseOnramperSell: boolean;
}

export const launchDarklyFlagKeys = {
  releaseOnramperBuy: 'release_onramper_buy',
  extensionRevamp: 'extension_revamp',
  releaseBrowserFeature: 'release_browser_feature',
  releaseCollectiblesFeature: 'release_collectibles_feature',
  collectibleDetails: 'collectible_details',
  releasePushNotifications: 'release_push_notifications',
  releaseWaitlistFeatures: 'release_waitlist_features',
  releaseDynamicFeeFeature: 'release_dynamic_fee_feature',
  releaseEarnFeature: 'release_earn_feature',
  releaseDappSuggestionsFeature: 'release_dapp_suggestions_feature',
  releaseSip10SendFeature: 'release_sip10_send_feature',
  sendPasteButton: 'send_paste_button',
  tokenDetails: 'token_details',
  minimumAppVersion: 'minimum_app_version',
  releaseBtcConversionUnitFeature: 'release_btc_conversion_unit_feature',
  internationalization: 'internationalization',
  releaseTokenManagement: 'release_token_management',
  swap: 'swap',
  releaseOnramperSell: 'release_onramper_sell',
} as const satisfies Record<keyof FeatureFlags, string>;

export const featureFlagDefaults: FeatureFlags = {
  releaseOnramperBuy: false,
  extensionRevamp: false,
  releaseBrowserFeature: false,
  releaseCollectiblesFeature: false,
  collectibleDetails: false,
  releasePushNotifications: false,
  releaseWaitlistFeatures: false,
  releaseDynamicFeeFeature: false,
  releaseEarnFeature: false,
  releaseDappSuggestionsFeature: false,
  releaseSip10SendFeature: false,
  sendPasteButton: false,
  tokenDetails: false,
  minimumAppVersion: '',
  releaseBtcConversionUnitFeature: false,
  internationalization: false,
  releaseTokenManagement: false,
  swap: false,
  releaseOnramperSell: false,
};
