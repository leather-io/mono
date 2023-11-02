# Lint-staged configuration

The purpose of `lint-staged` is to help lint files before they got committed.

## Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Prerequisites

- [➡ eslint](../../packages/eslint-config/README.md) - linting `javascript` and `typescript` languages.
- [➡ prettier](../../packages/prettier-config/README.md) - formatting `js`, `ts`, `tsx`, `md`, `json`, `yaml` files.

## Setup

- Add workspace reference to `lint-staged`:

  ```sh
  pnpm add -w lint-staged -D
  ```

- Add lint-staged configuration file:

  ```js
  // .lintstagedrc.mjs

  export default {
    '*.{mjs,js,ts,tsx,json,yaml}': 'pnpm lint:prettier',
    '*.{mjs,js,ts,tsx}': 'pnpm lint:eslint',
  };
  ```

## Usage

- **Automatic** linting of staged files on commit and rejection upon failure.

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
