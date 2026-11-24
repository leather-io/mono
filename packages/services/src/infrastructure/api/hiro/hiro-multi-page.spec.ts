import { fetchHiroCursorPages } from './hiro-multi-page';
import { type HiroCursorPageResponse } from './hiro-stacks-api.types';

describe(fetchHiroCursorPages.name, () => {
  function createMockCursorFetchFn(pageCount: number) {
    return vi.fn(async (cursor: string | null): Promise<HiroCursorPageResponse<string>> => {
      const page = cursor === null ? 0 : Number(cursor.replace('page-', ''));
      return await Promise.resolve({
        total: pageCount * 2,
        limit: 2,
        cursor: {
          next: page + 1 < pageCount ? `page-${page + 1}` : null,
          previous: page > 0 ? `page-${page - 1}` : null,
          current: `page-${page}`,
        },
        results: [`item-${page}-0`, `item-${page}-1`],
      });
    });
  }

  it('follows cursor.next until it is null', async () => {
    const mockFetch = createMockCursorFetchFn(3);

    const result = await fetchHiroCursorPages(mockFetch, { maxPages: 10 });

    expect(result).toEqual([
      'item-0-0',
      'item-0-1',
      'item-1-0',
      'item-1-1',
      'item-2-0',
      'item-2-1',
    ]);
    expect(mockFetch.mock.calls).toEqual([[null], ['page-1'], ['page-2']]);
  });

  it('stops after maxPages', async () => {
    const mockFetch = createMockCursorFetchFn(5);

    const result = await fetchHiroCursorPages(mockFetch, { maxPages: 2 });

    expect(result).toHaveLength(4);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns an empty list for an empty first page', async () => {
    const mockFetch = vi.fn(
      async (): Promise<HiroCursorPageResponse<string>> =>
        await Promise.resolve({
          total: 0,
          limit: 2,
          cursor: { next: null, previous: null, current: null },
          results: [],
        })
    );

    const result = await fetchHiroCursorPages(mockFetch, { maxPages: 10 });

    expect(result).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
