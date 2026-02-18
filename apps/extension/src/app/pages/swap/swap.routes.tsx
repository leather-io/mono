import type { Blockchain } from '@leather.io/models';

import { replaceRouteParams } from '@shared/utils/replace-route-params';

interface ConstructSwapRouteArgs {
  chain: Blockchain;
  route: string;
  params?: Record<string, string>;
}
export function constructSwapRoute({ chain, route, params }: ConstructSwapRouteArgs) {
  const baseRoute = route.replace('{chain}', `${chain}`);
  if (!params) return baseRoute;
  return replaceRouteParams(baseRoute, params);
}
