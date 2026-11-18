export const PlaygroundSelectors = {
  StakingAcknowledgmentReview: 'staking-acknowledgment-review',
} as const;
export type PlaygroundSelectors = (typeof PlaygroundSelectors)[keyof typeof PlaygroundSelectors];
