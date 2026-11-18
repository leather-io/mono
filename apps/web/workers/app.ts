import { createRequestHandler } from 'react-router';

import { getCanonicalHostRedirect } from './canonical-host-redirect';
import { withSecurityHeaders } from './security-headers';
import { getStagingRedirect } from './staging-redirect';

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const redirect = getCanonicalHostRedirect(request) ?? getStagingRedirect(request);
    if (redirect) return withSecurityHeaders(redirect);

    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    });

    return withSecurityHeaders(response);
  },
} satisfies ExportedHandler<Env>;
