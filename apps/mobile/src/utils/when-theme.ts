import type { Theme } from '@/state/settings/settings.slice';

type ThemeMap<T> = Record<Theme, T>;

export function whenTheme(theme: Theme) {
  return <T extends ThemeMap<unknown>>(map: T) => map[theme] as T[Theme];
}
