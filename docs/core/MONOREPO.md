# Package configuration

The purpose of this monorepo is to host various **[npm packages ↗](https://docs.npmjs.com/about-packages-and-modules)** to facilitate code sharing and at high standards. At it's core it uses `npm workspaces` and `nx` to manage the monorepo.

## Contents

- [Setup](#setup)
- [License](#license)

## Setup

- Create `package.json` file:

  ```jsonc
  // package.json

  {
    // Package info

    "name": "eather-mono",
    "description": "...",
    "author": "...",
    "license": "MIT",

    // Common scripts

    "scripts": {
      "lint-projects:all": "nx run-many -t format,lint,typecheck --parallel=1",
      "lint-projects:affected": "npx nx affected -t format,lint,typecheck --parallel=1 --base=dev",
      "commitlint": "commitlint"
    },

    // Specify workspaces

    "workspaces": ["packages/*", "apps/*"],

    // Only allow npm as package manager

    "engines": {
      "node": ">=20.3.0",
      "npm": ">=10",
      "pnpm": "please-use-npm",
      "yarn": "please-use-npm"
    }
  }
  ```

- Add npm configuration file:

  ```yaml
  # .npmrc

  engine-strict = true
  auto-install-peers = true
  ```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
