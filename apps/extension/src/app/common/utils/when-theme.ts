type Theme = 'light' | 'dark';
interface ThemeMap<TLight, TDark> {
  light: TLight;
  dark: TDark;
}

export function whenTheme(theme: Theme) {
  return <TLight, TDark>(map: ThemeMap<TLight, TDark>) => map[theme];
}
