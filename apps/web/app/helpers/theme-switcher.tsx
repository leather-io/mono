import { useHints } from '~/components/client-hints';

export function useTheme() {
  const hints = useHints();
  return hints.theme;
}
