# Package configuration

The purpose of this monorepo is to host various **[npm packages ↗](https://docs.npmjs.com/about-packages-and-modules)** to facilitate code sharing and at high standards. At it's core it uses `pnpm workspaces` to manage the monorepo

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
      "install:clean": "rm -rf \"**/node_modules\" && pnpm -r clean",
      "install:fresh": "pnpm install:clean && pnpm i",
      "install:nuke": "rm -rf pnpm-lock.yaml && pnpm install:fresh",
    },

    // Only allow pnpm as package manager

    "engines": {
      "node": ">=14.16.0",
      "pnpm": ">=7.10.0",
      "npm": "please-use-pnpm",
      "yarn": "please-use-pnpm",
    },
    "packageManager": "pnpm@8.7.5",
  }
  ```

- Add npm configuration file:

  ```yaml
  # .npmrc

  engine-strict = true
  auto-install-peers = true
  ```

- Add pnpm workspace file:

  ```yaml
  # pnpm-workspace.yaml

  packages:
    - 'packages/*'
  ```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
