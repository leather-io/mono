/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
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
  format: 'po',
};
