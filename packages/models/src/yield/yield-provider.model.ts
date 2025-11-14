export const YieldProviderKeys = {
  bitflow: 'bitflow',
  zest: 'zest',
  granite: 'granite',
  stackingDao: 'stackingdao',
  lisa: 'lisa',
  hermetica: 'hermetica',
  fastPool: 'fast-pool',
  xverse: 'xverse',
  velar: 'velar',
} as const;
export type YieldProviderKey = (typeof YieldProviderKeys)[keyof typeof YieldProviderKeys];

export interface YieldProvider {
  readonly key: YieldProviderKey;
  readonly name: string;
  readonly logo: string;
  readonly url: string;
}
