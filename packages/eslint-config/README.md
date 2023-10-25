# Shared eslint configuration

The purpose of `eslint` is linting `javascript` and `typescript` languages (`js`, `ts`, `tsx`).

> This configuration targets **monorepo** packages.

---

## Contents

- [Setup](#setup)
- [Automation](#automation)
- [Usage](#usage)
- [License](#license)

## Setup

- Add workspace reference to `@muravjev/configs-eslint-ts` and its peer dependencies:

  ```sh
  pnpm add -w @muravjev/configs-eslint-ts eslint
  ```

- Add eslint configuration file:

  ```js
  // .eslintrc.js

  module.exports = require('@muravjev/configs-eslint-ts');
  ```

- Add eslint ignore patterns file:

  ```sh
  # .eslintignore

  !.*
  node_modules/

  # Custom ignore patterns
  ...
  ```

- Add eslint scripts:

  ```jsonc
  // package.json

  "scripts": {
    ...
    "lint": "eslint --ext js,cjs,mjs,ts,tsx",
    "lint:fix": "pnpm lint --fix"
    ...
  }
  ```

## Automation

- Setup [➡ eslint vscode plugin](../../docs/plugins/vscode-eslint.md) to integrate `eslint` with vscode environment.

## Usage

- **Automatic** validation file with `eslint` on save.
- **Automatic** validation of staged files with `eslint` on commit.
- Manual usage from command line:

  ```sh
  pnpm lint .
  pnpm lint:fix .
  ```

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
