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
    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    });

    const newHeaders = new Headers(response.headers);

    newHeaders.set('Content-Security-Policy', csp);
    newHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    newHeaders.set('Referrer-Policy', 'no-referrer');
    newHeaders.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    newHeaders.set('Accept-CH', 'Sec-CH-Prefers-Color-Scheme');
    newHeaders.set('Vary', 'Sec-CH-Prefers-Color-Scheme');
    newHeaders.set('Critical-CH', 'Sec-CH-Prefers-Color-Scheme');

    return new Response(response.body, {
      ...response,
      headers: newHeaders,
      status: response.status,
      statusText: response.statusText,
    });
  },
} satisfies ExportedHandler<Env>;
