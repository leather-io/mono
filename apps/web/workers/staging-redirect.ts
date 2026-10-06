const legacyStagingHostname = 'dev-leather-web.wallet-6d1.workers.dev';
const stagingOrigin = 'https://staging.app.leather.io';
const permanentRedirectStatus = 301;

export function getStagingRedirect(request: Request) {
  const url = new URL(request.url);
  if (url.hostname !== legacyStagingHostname) return null;
  return Response.redirect(`${stagingOrigin}${url.pathname}${url.search}`, permanentRedirectStatus);
}
