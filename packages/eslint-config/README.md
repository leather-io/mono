# Shared eslint configuration

This package contains `eslint` configuration to be shared across projects.

---

## Contents

- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Setup

- Install as a dev dependancy in monorepo root:

  ```sh
  pnpm add -D @leather-wallet/eslint-config -w
  ```

- Install as a dev dependancy in external packages / apps:

  ```sh
  pnpm add -D @leather-wallet/eslint-config
  ```

- Add eslint configuration file:

  ```jsonc
  // .eslintrc
  {
    "extend": ["@leather-wallet/eslint-config"]
  }
  ```

- Add eslint ignore patterns file:

  ```sh
  # .eslintignore

  !.*
  node_modules/

  pnpm-lock.yaml
  .commitlintrc.js
  .prettierrc.js
  .eslintrc.js

  # Custom ignore patterns
  ...
  ```

- Add eslint scripts:

  ```jsonc
  // package.json

  "scripts": {
    ...
    "lint:eslint": "eslint --ignore-path .gitignore .",
    "lint:eslint:fix": "pnpm lint:eslint --fix",
    ...
  }
  ```

## Usage

- Manual usage from command line:

  ```sh
  pnpm lint:eslint
  pnpm lint:eslint:fix
  ```

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
