# Leather prettier config

This package is the prettier configuration for Leather

# Shared prettier configuration

`prettier` is used to auto format code in many language formats (`js`, `ts`, `tsx`, `md`, `json`, `yaml`).

---

## Contents

- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Setup

- Install as a dev dependancy in monorepo root:

  ```sh
  pnpm add -w @leather-wallet/prettier-config -D
  ```

- Install as a dev dependancy in external packages / apps:

  ```sh
  pnpm add @leather-wallet/prettier-config -D
  ```

- Add prettier configuration file:

  ```js
  // .prettierrc.js
  const defaultConfig = require('@leather-wallet/prettier-config');

  module.exports = {
    ...defaultConfig,
  };
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
    "lint:prettier": "prettier --check \"*.{ts,tsx,js,json}\"",
    "lint:prettier:fix": "prettier --write \"*.{ts,tsx,js,json}\" *.js",
    ...
  }
  ```

## Usage

- Manual usage from command line:

  ```sh
  pnpm lint:prettier
  pnpm lint:prettier:fix
  ```

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
