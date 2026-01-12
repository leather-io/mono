import { redirect } from 'react-router';

export function helpCenterRedirectLoader(request: Request) {
  const url = new URL(request.url);
  const newPath = url.pathname.replace('/help-center', '/support');
  const redirectUrl = `${url.origin}${newPath}${url.search}${url.hash}`;

  return redirect(redirectUrl, 301);
}
