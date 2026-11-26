import { useEffect } from 'react';

interface FetchPastEmptyActivityPagesOptions {
  isTailEmpty: boolean;
  isFetching: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage(): unknown;
}

export function useFetchPastEmptyActivityPages({
  isTailEmpty,
  isFetching,
  isFetchNextPageError,
  fetchNextPage,
}: FetchPastEmptyActivityPagesOptions) {
  useEffect(() => {
    if (isTailEmpty && !isFetching && !isFetchNextPageError) void fetchNextPage();
  }, [isTailEmpty, isFetching, isFetchNextPageError, fetchNextPage]);
}
