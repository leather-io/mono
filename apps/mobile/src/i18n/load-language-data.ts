import { AvailableLanguageCode } from '@/i18n/languages';

export async function loadLanguageData(code: AvailableLanguageCode) {
  switch (code) {
    case 'en':
      return Promise.all([
        import('./locales/en/messages'),
        import('@formatjs/intl-numberformat/locale-data/en'),
        import('@formatjs/intl-pluralrules/locale-data/en'),
      ]);
    default:
      return Promise.all([
        import('./locales/en/messages'),
        import('@formatjs/intl-numberformat/locale-data/en'),
        import('@formatjs/intl-pluralrules/locale-data/en'),
      ]);
  }
}
