import type { AppRoutes } from '@/shared/app-routes';

import type { FeatureEntry, FeaturePreconditions } from '@leather.io/tools/feature-entry';

type MobileFeatureGate = 'splashScreen' | 'none';

interface MobileFeaturePreconditions extends FeaturePreconditions {
  readonly accountType?: 'software';
  readonly mocks: readonly [];
}

export interface MobileFeatureEntry extends FeatureEntry {
  readonly routes: readonly AppRoutes[];
  readonly startRoute?: AppRoutes;
  readonly gate: MobileFeatureGate;
  readonly preconditions: MobileFeaturePreconditions;
}
