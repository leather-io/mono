import type { FeatureEntry } from '@leather.io/tools/feature-entry';

import type { RouteUrls } from '@shared/route-urls';

export interface ExtensionFeatureEntry extends FeatureEntry {
  readonly routes: readonly RouteUrls[];
  readonly startRoute?: RouteUrls;
}
