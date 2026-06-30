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
  'send',
  'receive',
  'swap',
  'bridge',
  'deposit',
  'withdraw',
  'claim-rewards',
  'add-liquidity',
  'remove-liquidity',
  'stake-lp',
  'unstake-lp',
  'stack',
  'initiate-unstack',
  'complete-unstack',
  'liquid-stack',
  'liquid-unstack',
  'borrow',
  'repay',
  'contract-execution',
  'contract-deploy',
] as const;

export type StacksProtocolAction = (typeof stacksProtocolActions)[number];
