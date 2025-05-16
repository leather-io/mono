import { useEffect, useRef } from 'react';

import { useFakeLoading } from '~/utils/fake-loading';

/**
 * Hook that manages fake loading state for user positions
 * @param isLoading - Boolean indicating if the actual data is currently loading
 * @returns Object containing the fake loading state
 */
export function useUserPositionsFakeLoading(isLoading: boolean) {
  const { fakeLoading, startFakeLoading } = useFakeLoading();

  // Keep track of the previous loading state
  // This helps us detect when loading transitions from true to false
  const previousState = useRef(false);

  useEffect(() => {
    // Only trigger fake loading when:
    // 1. The actual data has finished loading (isLoading is false)
    // 2. The previous state was loading (previousState.current is true)
    // This ensures we only show the fake loading state after a real loading state
    if (!isLoading && previousState.current) {
      startFakeLoading();
    }

    // Update the previous state for the next render
    previousState.current = isLoading;
  }, [isLoading, startFakeLoading]);

  return { fakeLoading };
}
