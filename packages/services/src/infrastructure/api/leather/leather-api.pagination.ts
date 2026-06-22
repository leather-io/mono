export interface LeatherApiPageRequest {
  page: number;
  pageSize: number;
}

export interface LeatherApiPage<T> {
  meta: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  data: T[];
}

export function getPageRequestQueryParams(pageRequest: LeatherApiPageRequest): URLSearchParams {
  return new URLSearchParams({
    page: pageRequest.page.toString(),
    pageSize: pageRequest.pageSize.toString(),
  });
}
