export const StacksProtocolIds = {
  alex: 'alex',
  arkadiko: 'arkadiko',
  bitflow: 'bitflow',
  fastPool: 'fast-pool',
  granite: 'granite',
  hermetica: 'hermetica',
  sbtcBridge: 'sbtc-bridge',
  stackingDao: 'stacking-dao',
  velar: 'velar',
  xverse: 'xverse',
  zest: 'zest',
} as const;

export type StacksProtocolId = (typeof StacksProtocolIds)[keyof typeof StacksProtocolIds];

export interface StacksProtocol {
  readonly id: StacksProtocolId;
  readonly name: string;
  readonly url: string;
  readonly logo: string;
  readonly description?: string;
}

export const stacksProtocolActions = [
  'swap',
  'add-liquidity',
  'remove-liquidity',
  'stake',
  'unstake',
  'stack',
  'unstack',
  'deposit',
  'withdraw',
  'borrow',
  'repay',
  'claim-rewards',
  'bridge',
] as const;

export type StacksProtocolAction = (typeof stacksProtocolActions)[number];
