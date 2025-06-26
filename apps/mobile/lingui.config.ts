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
  // this was changed recently to use the explicitIdAsDefault option
  //https://github.com/leather-io/mono/commit/43089ce176eb80935e0df807e986ce722672cf79#diff-bda5802c44f629361b889cea2231c1a8fe197563d9135d5abbde308ac0daa20d

  // it was  format: formatter({ explicitIdAsDefault: true, printLinguiId: true }),
  // next it was   format: formatter({ explicitIdAsDefault: true }),
  // now reverting to original format
  format: 'po',
};

export default config;
