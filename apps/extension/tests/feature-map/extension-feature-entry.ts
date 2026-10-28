import type { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';
import type { FeatureEntry, FeaturePreconditions } from '@leather.io/tools/feature-entry';
import type { VerifyAccountType } from '@leather.io/tools/verify-contract';

import type { RouteUrls } from '@shared/route-urls';

interface ExtensionFeaturePreconditions extends FeaturePreconditions {
  readonly network?: WalletDefaultNetworkConfigurationIds;
  readonly accountType?: VerifyAccountType;
}

export interface ExtensionFeatureEntry extends FeatureEntry {
  readonly routes: readonly RouteUrls[];
  readonly startRoute?: RouteUrls;
  readonly preconditions: ExtensionFeaturePreconditions;
}
