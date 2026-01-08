function getUrlString(input: RequestInfo | URL): string {
  if (input instanceof URL) return input.toString();
  if (typeof input === 'string') return input;
  return input.url;
}

export async function fetchFn(input: RequestInfo | URL, init?: RequestInit) {
  const url = getUrlString(input);

  const finalInit = url.includes('hiro.so')
    ? {
        ...init,
        headers: {
          ...init?.headers,
          // eslint-disable-next-line lingui/no-unlocalized-strings
          'x-partner': 'Leather',
        },
      }
    : init;

  return await fetch(input, finalInit);
}
