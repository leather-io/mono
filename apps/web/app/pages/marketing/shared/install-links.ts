export const installLinks = {
  chrome: 'https://chrome.google.com/webstore/detail/hiro-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj',
  ios: 'https://apps.apple.com/us/app/leather-self-custody-wallet/id6499127775',
  android: 'https://play.google.com/store/apps/details?id=io.leather.mobilewallet',
} as const;

export type InstallPlatform = keyof typeof installLinks;
