const sanityProjectId = '70cnou7r';
const sanityDataset = 'production';
const sanityApiVersion = '2024-01-01';
const sanityCdnBaseUrl = `https://${sanityProjectId}.apicdn.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}`;

interface SanityQueryResult<T> {
  result: T;
}

export async function querySanityCdn<T>(query: string, signal?: AbortSignal): Promise<T> {
  const url = `${sanityCdnBaseUrl}?query=${encodeURIComponent(query)}`;
  const resp = await fetch(url, { signal });
  if (!resp.ok) {
    throw new Error(`Sanity CDN request failed: ${resp.status}`);
  }
  const data: SanityQueryResult<T> = await resp.json();
  return data.result;
}
