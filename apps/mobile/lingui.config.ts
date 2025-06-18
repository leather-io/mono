import { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

const config: LinguiConfig = {
  locales: ['en', 'pseudo-locale'],
  pseudoLocale: 'pseudo-locale',
  sourceLocale: 'en',
  fallbackLocales: {
    'pseudo-locale': 'en',
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: formatter({ explicitIdAsDefault: true }),
};

export default config;
