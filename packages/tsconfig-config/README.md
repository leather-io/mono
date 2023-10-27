# Shared typescript configuration

The purpose of [typescript](https://www.typescriptlang.org/) is to add strong typing to `javascript`.

## Contents

- [Setup](#setup)
- [License](#license)

## Setup

- Install as a dev dependancy in monorepo root:

  ```sh
  pnpm add -D @leather-wallet/tsconfig-config -w
  ```

- Install as a dev dependancy in external packages / apps:

  ```sh
  pnpm add -D @leather-wallet/tsconfig-config
  ```

- Add typescript configuration file to your package that extends the base

  ```jsonc
  // packages/package/tsconfig.json
  {
    "extends": ["@leather-wallet/tsconfig-config/tsconfig.base.json"],
    "include": ["**/*", ".*.ts"],
    "exclude": []
  }
  ```

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
