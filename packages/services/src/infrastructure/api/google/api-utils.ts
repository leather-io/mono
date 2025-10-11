export interface GoogleApiRequestOptions extends RequestInit {
  query?: Record<string, string>;
  token: string;
}

export async function googleApiRequest<T = any>(
  baseUrl: string,
  endpoint: string,
  { query, token, headers, ...rest }: GoogleApiRequestOptions
): Promise<T> {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : '';
  const url = `${baseUrl}/${endpoint}${qs}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API ${res.status}: ${text}`);
  }

  if (res.status === 204) return null as T;

  const text = await res.text();
  return text ? JSON.parse(text) : (null as T);
}

/** Helper for multipart upload body creation */
export function buildMultipartBody(
  metadata: object,
  body: any
): { body: string; contentType: string } {
  const boundary = `boundary-${Math.random().toString(36).slice(2)}`;
  const multipartBody = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    typeof body === 'string' ? body : JSON.stringify(body),
    `--${boundary}--`,
    '',
  ].join('\r\n');

  return {
    body: multipartBody,
    contentType: `multipart/related; boundary=${boundary}`,
  };
}
