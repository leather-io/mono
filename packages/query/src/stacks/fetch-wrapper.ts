import axios from 'axios';

// import { analytics } from '@shared/utils/analytics';

const leatherHeaders: HeadersInit = {
  // TODO #40: Need VERSION?
  // 'x-leather-version': VERSION,
  'x-hiro-product': 'leather',
};

function isErrorCode(statusCode: number) {
  return statusCode >= 400;
}

function trackApiError(url: string, statusCode: number) {
  // TODO #40: Use analytics here?
  // eslint-disable-next-line no-console
  console.log('api_error', { origin: new URL(url).origin, statusCode, url });
  // void analytics.track('api_error', { origin: new URL(url).origin, statusCode, url });
}

/**
 * @deprecated Use `axios` directly instead. Fetch only needed for interaction
 * with generated stacks blockchain api library
 */
export async function wrappedFetch(input: RequestInfo, init: RequestInit = {}) {
  const initHeaders = init.headers || {};
  // eslint-disable-next-line no-restricted-globals
  const resp = await fetch(input, {
    ...init,
    credentials: 'omit',
    headers: { ...initHeaders, ...leatherHeaders },
  });
  if (isErrorCode(resp.status)) trackApiError(resp.url, resp.status);
  return resp;
}

axios.interceptors.request.use(request => {
  if (request.url?.includes('hiro.so'))
    Object.entries(leatherHeaders).forEach(([key, value]) => request.headers.set(key, value));

  return request;
});

axios.interceptors.response.use(response => {
  if (isErrorCode(response.status)) trackApiError(response.config.url ?? '', response.status);
  return response;
});
