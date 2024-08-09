import { messages as english } from './en/messages';
import { messages as pseudo } from './pseudo-locale/messages';

export const LOCALES = [
  {
    /* eslint-disable-next-line lingui/no-unlocalized-strings  */
    label: 'English',
    locale: 'en',
    messages: english,
  },
  {
    /* eslint-disable-next-line lingui/no-unlocalized-strings  */
    label: 'Spanish',
    locale: 'es',
    messages: english,
  },
  {
    /* eslint-disable-next-line lingui/no-unlocalized-strings  */
    label: 'PseudoEnglish',
    locale: 'pseudo-locale',
    messages: pseudo,
  },
];

export const LOCALE_CODES = LOCALES.map(({ locale }) => locale);

export const DEFAULT_LOCALE = 'en';
