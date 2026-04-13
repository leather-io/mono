export interface LeatherApiPageRequest {
  page: number;
  pageSize: number;
}

export function getPageRequestQueryParams(pageRequest: LeatherApiPageRequest): URLSearchParams {
  return new URLSearchParams({
    page: pageRequest.page.toString(),
    pageSize: pageRequest.pageSize.toString(),
  });
}
