export const featureEntryKinds = ['nav', 'deepLink', 'rpc', 'keyboard'] as const;
export type FeatureEntryKind = (typeof featureEntryKinds)[number];

export const featureGates = [
  'account',
  'onboarding',
  'ledgerStacks',
  'ledgerBitcoin',
  'none',
] as const;
export type FeatureGate = (typeof featureGates)[number];

export const featureSessions = ['signed-in', 'signed-out', 'locked'] as const;
export type FeatureSession = (typeof featureSessions)[number];

export const featureAnchorKinds = ['route', 'selectors', 'rpc', 'behavior'] as const;
export type FeatureAnchorKind = (typeof featureAnchorKinds)[number];

export interface RouteAnchor {
  readonly kind: 'route';
}

export interface SelectorsAnchor {
  readonly kind: 'selectors';
  readonly objects: readonly string[];
}

export interface RpcAnchor {
  readonly kind: 'rpc';
  readonly handlers: readonly string[];
}

export interface BehaviorAnchor {
  readonly kind: 'behavior';
}

export type FeatureAnchor = RouteAnchor | SelectorsAnchor | RpcAnchor | BehaviorAnchor;

export interface FeatureParam {
  readonly name: string;
  readonly example: string;
}

export interface FeatureEntryPoint {
  readonly kind: FeatureEntryKind;
  readonly steps: readonly string[];
  readonly method?: string;
}

export interface FeaturePreconditions {
  readonly session: FeatureSession;
  readonly network?: string;
  readonly accountType?: string;
  readonly mocks: readonly string[];
}

export interface FeatureSelectors {
  readonly ready?: string;
  readonly others: readonly string[];
}

export interface FeatureEntry {
  readonly id: string;
  readonly anchor: FeatureAnchor;
  readonly routes: readonly string[];
  readonly startRoute?: string;
  readonly open?: readonly string[];
  readonly deepLinkable?: boolean;
  readonly params: readonly FeatureParam[];
  readonly entry: readonly FeatureEntryPoint[];
  readonly gate: FeatureGate;
  readonly flags: readonly string[];
  readonly preconditions: FeaturePreconditions;
  readonly selectors: FeatureSelectors;
  readonly actions: readonly string[];
  readonly specs: readonly string[];
  readonly description: string;
}
