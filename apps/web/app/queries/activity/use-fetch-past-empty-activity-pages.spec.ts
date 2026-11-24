import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFetchPastEmptyActivityPages } from './use-fetch-past-empty-activity-pages';

describe(useFetchPastEmptyActivityPages.name, () => {
  const idleState = { isTailEmpty: true, isFetching: false, isFetchNextPageError: false };

  it('fetches the next page when the loaded tail is empty and more pages remain', () => {
    const fetchNextPage = vi.fn();
    renderHook(() => useFetchPastEmptyActivityPages({ ...idleState, fetchNextPage }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('waits while a fetch is in flight', () => {
    const fetchNextPage = vi.fn();
    renderHook(() =>
      useFetchPastEmptyActivityPages({ ...idleState, isFetching: true, fetchNextPage })
    );
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('stops after a next-page error', () => {
    const fetchNextPage = vi.fn();
    renderHook(() =>
      useFetchPastEmptyActivityPages({ ...idleState, isFetchNextPageError: true, fetchNextPage })
    );
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does nothing when the tail has items', () => {
    const fetchNextPage = vi.fn();
    renderHook(() =>
      useFetchPastEmptyActivityPages({ ...idleState, isTailEmpty: false, fetchNextPage })
    );
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
