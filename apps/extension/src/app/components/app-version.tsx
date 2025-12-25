import { useFlags } from '@app/features/feature-flags';

import { AppVersion as CurrentAppVersion } from './app-version-current';
import { AppVersion as LegacyAppVersion } from './app-version-legacy';

export function AppVersion() {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <CurrentAppVersion /> : <LegacyAppVersion />;
}
