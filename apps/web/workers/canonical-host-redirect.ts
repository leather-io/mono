const canonicalOrigin = 'https://leather.io';
const redirectedHostnames = new Set(['app.leather.io', 'www.leather.io']);
const permanentRedirectStatus = 301;

export function getCanonicalHostRedirect(request: Request) {
  const url = new URL(request.url);
  if (!redirectedHostnames.has(url.hostname)) return null;
  return Response.redirect(
    `${canonicalOrigin}${url.pathname}${url.search}`,
    permanentRedirectStatus
  );
}
