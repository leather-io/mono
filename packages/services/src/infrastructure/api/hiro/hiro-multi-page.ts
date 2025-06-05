import { HiroPageRequest, HiroPageResponse } from './hiro-stacks-api.types';

interface HiroSomePagesRequest {
  allPages?: undefined;
  pages: number;
}

interface HiroAllPagesRequest {
  allPages: true;
  pages?: never;
  stopAfter?: number;
}

export type HiroMultiPageRequest = HiroSomePagesRequest | HiroAllPagesRequest;

type HiroPageFetchFn<T> = (page: HiroPageRequest) => Promise<HiroPageResponse<T>>;

export async function fetchHiroPages<T>(
  fetchFn: HiroPageFetchFn<T>,
  options: {
    limit: number;
    pagesRequest: HiroMultiPageRequest;
  }
): Promise<T[]> {
  const { limit, pagesRequest } = options;
  if (!pagesRequest.allPages) {
    // multi-page: fetch all pages in parallel
    const pages = await Promise.all(
      Array.from({ length: pagesRequest.pages }, (_, i) => fetchFn({ limit, offset: i * limit }))
    );
    return pages.flatMap(page => page.results);
  } else {
    // all pages: fetch first page & calculate total, then fetch remaining pages
    const firstPage = await fetchFn({ limit, offset: 0 });
    const totalPages = Math.ceil(firstPage.total / limit);
    const pagesToFetch = pagesRequest.stopAfter
      ? Math.min(totalPages, pagesRequest.stopAfter)
      : totalPages;

    if (pagesToFetch <= 1) return firstPage.results;

    const remainingPages = await Promise.all(
      Array.from({ length: pagesToFetch - 1 }, (_, i) =>
        fetchFn({ limit, offset: (i + 1) * limit })
      )
    );

    return [...firstPage.results, ...remainingPages.flatMap(page => page.results)];
  }
}
