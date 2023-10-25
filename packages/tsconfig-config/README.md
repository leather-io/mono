# Shared prettier configuration

The purpose of `prettier` is formatting many language formats (`js`, `ts`, `tsx`, `md`, `json`, `yaml`).

---

## Contents

- [Setup](#setup)
- [Automation](#automation)
- [Usage](#usage)
- [License](#license)

## Setup

- Monorepo base: Add workspace reference to `@leather-wallet/eslint-config` and its peer dependencies:

  ```sh
  pnpm add -w -D @leather-wallet/eslint-config
  ```

- Monorepo package: Add reference to `@leather-wallet/eslint-config`:

  ```sh
  cd package/
  pnpm add -D @leather-wallet/eslint-config

  pnpm add --filter package -D @leather-wallet/eslint-config
  ```

- Add prettier configuration file:

  ```js
  // .prettierrc.js

  module.exports = require('@muravjev/configs-prettier');
  ```

- Add prettier ignore patterns file:

  ```sh
  # .prettierignore

  node_modules/
  pnpm-lock.yaml

  # Custom ignore patterns
  ...
  ```

- Add prettier scripts:

  ```jsonc
  // package.json

  "scripts": {
    ...
    "format": "prettier",
    "format:check": "pnpm format --check --debug-check",
    "format:fix": "pnpm format --write"
    ...
  }
  ```

## Automation

- Setup [➡ prettier vscode plugin](../../docs/plugins/vscode-prettier.md) to integrate `prettier` with vscode environment.

## Usage

- **Automatic** format file with `prettier` on save.
- **Automatic** format of staged files with `prettier` on commit.
- Manual usage from command line:

  ```sh
  pnpm format:check .
  pnpm format:fix .
  ```

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
