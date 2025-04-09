import { createRequestHandler } from 'react-router';

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
    //
    // Demo implementation of a proxy
    if (request.url.includes('/blog')) {
      const url = new URL(request.url);
      url.hostname = 'leather.io';
      url.pathname = '/blog' + url.pathname.replace('/blog', '');

      const modifiedRequest = new Request(url, request);
      const resp = await fetch(modifiedRequest);
      return new Response(resp.body, resp);
    }
    //
    // End demo

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
