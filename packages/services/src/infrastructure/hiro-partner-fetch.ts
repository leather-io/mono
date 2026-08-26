let isInstalled = false;

function toUrl(input: RequestInfo | URL): URL | null {
  try {
    if (typeof input === 'string' || input instanceof URL) return new URL(input.toString());
    return new URL(input.url);
  } catch {
    return null;
  }
}

export function installHiroPartnerFetch() {
  if (isInstalled) return;
  isInstalled = true;

  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = toUrl(input);
    if (!url?.hostname.endsWith('hiro.so')) return originalFetch(input, init);

    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined)
    );
    headers.set('X-Partner', 'Leather');
    return originalFetch(input, { ...init, headers });
  };
}
