import { fetchHiroPages } from './hiro-multi-page';
import { HiroPageRequest, HiroPageResponse } from './hiro-stacks-api.types';

describe(fetchHiroPages.name, () => {
  function createMockFetchFn(totalItems: number) {
    const mockFn = vi.fn(async (page: HiroPageRequest): Promise<HiroPageResponse<string>> => {
      return await Promise.resolve({
        limit: page.limit,
        offset: page.offset,
        total: totalItems,
        results: Array.from(
          { length: Math.min(page.limit, totalItems - page.offset) },
          (_, i) => `item-${page.offset + i}`
        ),
      });
    });
    return mockFn;
  }

  describe('some pages mode', () => {
    it('should fetch specified number of pages in parallel', async () => {
      const mockFetch = createMockFetchFn(100);

      const result = await fetchHiroPages(mockFetch, {
        limit: 20,
        pagesRequest: { pages: 2 },
      });

      expect(result).toHaveLength(40);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith({ limit: 20, offset: 0 });
      expect(mockFetch).toHaveBeenCalledWith({ limit: 20, offset: 20 });
    });

    it('should handle empty results', async () => {
      const mockFetch = createMockFetchFn(0);

      const result = await fetchHiroPages(mockFetch, {
        limit: 20,
        pagesRequest: { pages: 2 },
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('all pages mode', () => {
    it('should fetch all pages when total items span multiple pages', async () => {
      const mockFetch = createMockFetchFn(55);

      const result = await fetchHiroPages(mockFetch, {
        limit: 20,
        pagesRequest: { allPages: true },
      });

      expect(result).toHaveLength(55);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should respect stopAfter parameter', async () => {
      const mockFetch = createMockFetchFn(100);

      const result = await fetchHiroPages(mockFetch, {
        limit: 20,
        pagesRequest: { allPages: true, stopAfter: 2 },
      });

      expect(result).toHaveLength(40);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle single page result', async () => {
      const mockFetch = createMockFetchFn(15);

      const result = await fetchHiroPages(mockFetch, {
        limit: 20,
        pagesRequest: { allPages: true },
      });

      expect(result).toHaveLength(15);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
      const mockFetch = createMockFetchFn(0);

      const result = await fetchHiroPages(mockFetch, {
        limit: 20,
        pagesRequest: { allPages: true },
      });

      expect(result).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
