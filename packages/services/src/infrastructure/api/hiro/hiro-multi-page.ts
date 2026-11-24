import { type HiroCursorPageResponse } from './hiro-stacks-api.types';

type HiroCursorPageFetchFn<T> = (cursor: string | null) => Promise<HiroCursorPageResponse<T>>;

export async function fetchHiroCursorPages<T>(
  fetchFn: HiroCursorPageFetchFn<T>,
  { maxPages }: { maxPages: number }
): Promise<T[]> {
  const results: T[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const res = await fetchFn(cursor);
    results.push(...res.results);
    if (res.cursor.next === null) break;
    cursor = res.cursor.next;
  }
  return results;
}
