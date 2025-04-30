import { createRequestHandler } from 'react-router';

import { csp } from './csp';

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
    const resp = await requestHandler(request, {
      cloudflare: { env, ctx },
    });

    const headers = new Headers(resp.headers);
    headers.set('Content-Security-Policy', csp);
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return new Response(resp.body, { ...resp, headers });
  },
} satisfies ExportedHandler<Env>;
