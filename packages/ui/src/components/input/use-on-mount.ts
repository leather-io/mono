import { useEffect } from 'react';

import { isFunction } from '@leather.io/utils';

/**
 * @deprecated
 * FIXME leather-io/issues#64": This is a double up of a hook that already exists in the codebase.
 * This is a double up of a hook that already exists in the codebase.
 * see the Leather wallet extension app/common/hooks/use-on-mount.ts
 * Do not perpetuate its use. It's only here to support the legacy codebase.
 * Could potentially be replaced with useEffect(() => effect(), []) in most cases.
 */
export function useOnMount(effect: () => void | (() => void) | Promise<unknown>) {
  useEffect(() => {
    const fn = effect();
    return () => (isFunction(fn) ? fn() : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
