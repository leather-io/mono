# Leather Mobile Wallet

Leather is the most popular and trusted wallet for apps built on Bitcoin. And now it's coming to iOS and Android!

## Development

This app is an [Expo](https://expo.dev/) mobile application. So there are a few prerequisites to have installed on your computer before we can proceed.

### Prerequisites

- [Node and Pnpm](https://nodejs.org/en/download)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall) for MacOS and Linux users.
- `pnpm i` in the monorepo root folder.

If you want to run this in an iOS simulator:

- MacOS computer
- [XCode](https://apps.apple.com/am/app/xcode/id497799835)
- [Install CocoaPods](https://guides.cocoapods.org/using/getting-started.html)

And for Android emulator:

- [Android studio](https://developer.android.com/studio)
- [Install Android emulator with Android studio](https://developer.android.com/studio/run/emulator#avd)

Running on iOS device:

- Install [Expo app from AppStore](https://apps.apple.com/am/app/expo-go/id982107779) on your device.
- Scan the QR code that is going to be shown in the terminal after running the expo server in the next section

Running on Android device

- Install [Expo app from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&pli=1) on your device.
- Scan the QR code that is going to be shown in the terminal after running the expo server in the next section

#### Credentials

1. When running `pnpm run ios` or `pnpm run android`, you are going to be prompted for the firebase login.
   That is essential for building the app and it is needed for firebase push notifications
2. You would also need to have .env setup.
   You can either do it yourself using .env.example file or you can use 1password cli to download it from the vault.
   To do that you would need to run `pnpm run 1password:env:dev` to install the .env file.

To make sure you have 1password cli installed and signed in on your machine, follow these instructions: https://developer.1password.com/docs/cli/get-started

### Running the application

- `pnpm run start` if you want to test the app on your personal Android or iOS device

- `pnpm run ios` if you want to run it on iOS simulator

- `pnpm run android` if you want to run it on Android emulator

If you encounter difficulties with `pnpm run ios` you can instead run:

- `pnpm start`

- Once started press `i` to open it in the ios simulator

## Internationalization

We use [Lingui](http://lingui.dev/) for handling translations in the app. Familiarity with
the library, and concepts such as [message extraction](https://lingui.dev/guides/message-extraction), [ICU](https://lingui.dev/guides/message-format) and [pluralization](https://lingui.dev/guides/plurals)
is recommended.

### Workflow

All UI text in the code must be translatable using helpers from Lingui.

### Preferred way of writing basic messages

```tsx
import { t } from '@lingui/core/macro';

// Use `t` with tagged template literals:
<Text>{t`View and manage all your wallets in one place`}</Text>;
```

### Basic interpolation

```tsx
import { t } from '@lingui/core/macro';

// Use interpolation as you would normally
<Text>
  t`${feeRate} sats/vB · ${quoteFee}`
</Text>;
```

Lingui will automatically pick up the interpolation, and preserve variable
names for translators:

```
# messages.po
#: src/features/approver/components/fees/bitcoin-fee-option.tsx:41
msgid "{feeRate} sats/vB · {formattedQuoteFee}"
msgstr "{feeRate} sats/vB · {formattedQuoteFee}"
```

**Important**: The app reloads when language changes, so we don't re-render components in real-time.
This means you don't need `useLingui` hook — it adds unnecessary complexity without benefit.

The preference hierarchy for translations is:

1. **Use `t` macro with template literals for most scenarios** — it's the simplest and most readable
2. **Use lazy `msg` when `t` cannot be used** (outside functions, module-level declarations) — then wrap with `i18n._()` when rendering
3. **Avoid `useLingui` hook** — we don't need reactive re-rendering for language changes
4. **Avoid directly importing `i18n` for translations** — use `t` macro instead

#### Limitations

`t` macro can only be used within functions. In scenarios when this isn't possible, or you need
to declare strings at module-level, resort to [lazy translations](https://lingui.dev/ref/macro#definemessage):

```tsx
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

const statusMessages = {
  success: msg`Success`,
  error: msg`Error`,
  loading: msg`Loading...`,
};

// use when needed
<Text>{i18n._(statusMessages.success)}</Text>;
```

#### Extraction

Message extraction happens automatically when you commit changes to mobile — no manual action needed.
Compilation runs automatically on `pnpm install`.

If you're actively working on translations and need to run extraction and compilation manually:

```
pnpm lingui
```

This runs both extraction and compilation in one command.

### Adding a new language

To add support for a new language:

1. **Update `lingui.config.ts`**: Add the language code to the `locales` array:

```ts
locales: ['en', 'es', 'fr']; // Add your language code
```

2. **Update `languages.ts`**: Add the language to the `supportedLanguages` object:

```ts
export const supportedLanguages = {
  en: 'English',
  es: 'Español', // Add your language
  fr: 'Français',
} as const;
```

3. **Update `load-language-data.ts`**: Add a case for loading the language's messages and polyfills:

```ts
case 'es':
  return Promise.all([
    import('./locales/es/messages'),
    import('@formatjs/intl-numberformat/locale-data/es'),
    import('@formatjs/intl-pluralrules/locale-data/es'),
  ]);
```

4. **Create the locale folder**: Create the directory structure `src/i18n/locales/{locale}/` and
   run `pnpm lingui:extract` to generate the initial message catalog.

#### ESLint

`eslint` is used to enforce all text using `lingui` in the mobile app.

- exceptions can be added to the `eslint.config.js`
- via overrides (`eslint-disable lingui/no-unlocalized-strings`)

#### ci

`lingui-checks.yml` is used to verify that any new / updated translations have been added to the `messages.po` file. The job is triggered by pull requests to `apps/mobile`.

The workflow runs:

- `pnpm lingui:extract` to generate `messages.po` based on translation
- `pnpm lingui:compile` to test compilation errors (e.g. same id with different text)
- `git diff` to see if `messages.po` has been updated by the extract

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
