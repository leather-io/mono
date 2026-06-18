import { useHasKeys } from './use-has-keys';

export function useCanSignOut() {
  const { hasKeys } = useHasKeys();
  return hasKeys;
}
