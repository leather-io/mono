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

// PETE - thinking about the best way to do this

// lingui is not supposed to override the translations from the po files but you can do it with --overwrite
// for our needs I think this is good enough as :
// 1. we are not using the po files for anything else
// 2. we don't have a lot of translations / a translator
// 3. we can make code changes to the translations and they will be reflected in the po files and app
// 4. the code + local dev is easier to manage and the local app is reflective of the translations
// 5. if / when we want to add a translator we can do that and upload the po files to crowdin.
// -> Translator can translate the po files and we can use the crowdin UI to review the translations.
// -> We can get the .po files from crowdin and use them in the app without a complex OTA update process

// we can consider swaping the po files for json files as :
// Given that you're working on a mobile app, .json files might be better because:
// - Better performance on mobile devices
// - Smaller bundle size
// - Easier integration with React Native
// - Simpler workflow for development
//
// The choice depends on your translation workflow and team structure

// PETE : investigate using this https://lingui.dev/ref/metro-transformer so we can avoid using extract / compile
// see if it works with live reload

// we have about 500 translations which isn't much at all
