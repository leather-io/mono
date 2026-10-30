export const SbtcSelectors = {
  RewardsSunsetCallout: 'sbtc-rewards-sunset-callout',
  RewardsSunsetLink: 'sbtc-rewards-sunset-link',
} as const;
export type SbtcSelectors = (typeof SbtcSelectors)[keyof typeof SbtcSelectors];
