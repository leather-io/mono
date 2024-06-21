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

- Install as a dev dependency in packages / apps:

```sh
pnpm install -D @leather-wallet/prettier-config
```

- Add prettier configuration file:

  ```js
  // .prettierrc.js
  import defaultConfig from '@leather-wallet/prettier-config';

  export default { ...defaultConfig };
  ```

- Add prettier ignore patterns file:

  ```sh
  # .prettierignore

  node_modules/

  # Custom ignore patterns
  ...
  ```

- Add prettier scripts:

  ```jsonc
  // package.json

  "scripts": {
    "format": "prettier --write \"*.{js,jsx,ts,tsx}\"",
    ...
  }
  ```

## Usage

- Manual usage from command line:

  ```sh
  npm run format
  ```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
