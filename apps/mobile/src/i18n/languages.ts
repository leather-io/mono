/* eslint-disable lingui/no-unlocalized-strings  */
export const supportedLanguages = {
  en: 'English',
} as const;

export const defaultLanguage = 'en';

export type AvailableLanguageCode = keyof typeof supportedLanguages;
