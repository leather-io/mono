import type { Theme } from '@/store/settings/utils';

type ThemeMap<T> = Record<Theme, T>;

export function whenTheme(theme: Theme) {
  return <T extends ThemeMap<unknown>>(map: T): T[Theme] => map[theme];
}
