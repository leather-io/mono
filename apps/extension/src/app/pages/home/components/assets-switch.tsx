import { useFlags } from '@app/features/feature-flags';

import { Assets } from './assets';
import { AssetsLegacy } from './assets-legacy';

export function AssetsSwitch() {
  const { assetsRevamp } = useFlags();
  return assetsRevamp ? <Assets /> : <AssetsLegacy />;
}
