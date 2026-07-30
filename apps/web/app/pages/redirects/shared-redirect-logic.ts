import { redirect } from 'react-router';

function prefixRedirectLoader(request: Request, from: string, to: string) {
  const url = new URL(request.url);
  const newPath = url.pathname.replace(from, to);
  const redirectUrl = `${url.origin}${newPath}${url.search}${url.hash}`;

  return redirect(redirectUrl, 301);
}

export function helpCenterRedirectLoader(request: Request) {
  return prefixRedirectLoader(request, '/help-center', '/support');
}

export function stackingRedirectLoader(request: Request) {
  return prefixRedirectLoader(request, '/stacking', '/staking');
}
