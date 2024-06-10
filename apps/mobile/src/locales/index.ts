import { messages as english } from './en/messages';
import { messages as french } from './fr/messages';
import { messages as pseudo } from './pseudo-locale/messages';

export const LOCALES = [
  {
    label: 'English',
    locale: 'en',
    messages: english,
  },
  {
    label: 'Français',
    locale: 'fr',
    messages: french,
  },
  {
    label: 'PseudoEnglish',
    locale: 'pseudo-locale',
    messages: pseudo,
  },
];

export const LOCALE_CODES = LOCALES.map(({ locale }) => locale);

export const DEFAULT_LOCALE = 'en';
