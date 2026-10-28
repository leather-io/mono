const catalogViews = ['screens', 'viewer', 'frames', 'about', 'primitives', 'activity'];

export function catalogReturnUrl(search: string) {
  const params = new URLSearchParams(search);
  const saved = params.get('catalog');
  if (saved?.startsWith('?')) {
    const target = new URLSearchParams(saved);
    if (catalogViews.includes(target.get('view') ?? 'screens')) return saved;
  }
  return '?view=screens';
}

export function prototypeUrl(search: string, journeyId?: string, runId?: string) {
  const current = new URLSearchParams(search);
  const params = new URLSearchParams({ view: 'journeys' });
  const view = current.get('view') ?? 'screens';
  params.set(
    'catalog',
    catalogViews.includes(view) ? search || '?view=screens' : catalogReturnUrl(search)
  );
  for (const key of ['wallet', 'mode', 'controls']) {
    const value = current.get(key);
    if (value) params.set(key, value);
  }
  if (journeyId) params.set('journey', journeyId);
  if (runId) params.set('run', runId);
  return `?${params.toString()}`;
}

export function testerUrl(search: string, journeyId: string) {
  const params = new URLSearchParams(prototypeUrl(search, journeyId));
  params.set('mode', 'participant');
  params.delete('controls');
  return `?${params.toString()}`;
}
