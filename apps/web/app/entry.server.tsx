import { renderToReadableStream } from 'react-dom/server';
import {
  type AppLoadContext,
  type EntryContext,
  HandleErrorFunction,
  ServerRouter,
} from 'react-router';

import * as Sentry from '@sentry/react-router';
import { isbot } from 'isbot';

// eslint-disable-next-line func-style
export const handleError: HandleErrorFunction = (error, { request }) => {
  // React Router may abort some interrupted requests, report those
  if (!request.signal.aborted) {
    Sentry.captureException(error);
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext
) {
  let shellRendered = false;
  const userAgent = request.headers.get('user-agent');

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      },
    }
  );
  shellRendered = true;

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

export default handleRequest;

// FIXME: Supposedly this is the way you should handle Sentry errors on the
// server https://docs.sentry.io/platforms/javascript/guides/react-router/
// This fn is undefined in the Sentry package as of v9.12.0
// export default Sentry.sentryHandleRequest(handleRequest);
