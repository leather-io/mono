import { bnsHandlers } from './bns';
import { cmsHandlers } from './cms';
import { gammaHandlers } from './gamma';
import { hiroHandlers } from './hiro';
import { imageHandlers } from './images';
import { launchDarklyHandlers } from './launchdarkly';
import { leatherApiHandlers } from './leather-api';
import { mempoolHandlers } from './mempool';
import { swapProviderHandlers } from './swap-providers';
import { telemetryHandlers } from './telemetry';

export const baselineHandlers = [
  ...launchDarklyHandlers(),
  ...bnsHandlers(null),
  ...leatherApiHandlers,
  ...hiroHandlers,
  ...mempoolHandlers,
  ...swapProviderHandlers,
  ...gammaHandlers,
  ...imageHandlers,
  ...cmsHandlers,
  ...telemetryHandlers,
];
