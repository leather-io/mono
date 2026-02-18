import { rootRoute } from './root-route';
import { homeRoutes, tokenDetailsRoute } from './routes/home.routes';
import { miscRoutes } from './routes/misc.routes';
import { onboardingRoutes } from './routes/onboarding.routes';
import { receiveRoutes } from './routes/receive.routes';
import { requestRoutes } from './routes/request.routes';
import { rpcRoutes } from './routes/rpc.routes';
import { sendRoutes } from './routes/send.routes';
import { settingsRoutes } from './routes/settings.routes';
import { bitcoinSwapRoutes, stacksSwapRoutes } from './routes/swap.routes';

export const routeTree = rootRoute.addChildren([
  homeRoutes,
  ...receiveRoutes,
  tokenDetailsRoute,
  ...sendRoutes,
  bitcoinSwapRoutes,
  stacksSwapRoutes,
  ...onboardingRoutes,
  ...settingsRoutes,
  ...rpcRoutes,
  ...requestRoutes,
  ...miscRoutes,
]);
