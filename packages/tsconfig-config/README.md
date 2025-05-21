# Shared typescript configuration

The purpose of [typescript](https://www.typescriptlang.org/) is to add strong typing to `javascript`.

## Contents

- [Shared typescript configuration](#shared-typescript-configuration)
  - [Contents](#contents)
  - [Setup](#setup)
  - [License](#license)

## Setup

- Install as a dev dependency in packages / apps:

  ```sh
  pnpm add -D @leather.io/tsconfig-config
  ```

- Add typescript configuration file to your package that extends the base

  ```jsonc
  // packages/package/tsconfig.json
  {
    "extends": ["@leather.io/tsconfig-config/tsconfig.base.json"],
    "include": ["**/*", ".*.ts"],
    "exclude": [],
  }
  ```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
