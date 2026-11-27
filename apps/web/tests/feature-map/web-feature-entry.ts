import type { RouteUrls } from '~/route-urls';

import type {
  FeatureEntry,
  FeaturePreconditions,
  WebFeatureFlag,
  WebFeatureGate,
  WebFeatureSession,
} from '@leather.io/tools/feature-entry';

interface WebFeaturePreconditions extends Omit<FeaturePreconditions, 'session'> {
  readonly session: WebFeatureSession;
}

export interface WebFeatureEntry
  extends Omit<FeatureEntry, 'routes' | 'startRoute' | 'gate' | 'flags' | 'preconditions'> {
  readonly routes: readonly RouteUrls[];
  readonly startRoute?: RouteUrls;
  readonly gate: WebFeatureGate;
  readonly flags: readonly WebFeatureFlag[];
  readonly preconditions: WebFeaturePreconditions;
}
