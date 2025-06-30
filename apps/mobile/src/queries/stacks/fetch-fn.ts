export async function fetchFn(input: RequestInfo | URL, init?: RequestInit) {
  const url =
    input instanceof URL ? input.toString() : typeof input === 'string' ? input : input.url;

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
