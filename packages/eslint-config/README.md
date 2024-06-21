# Shared eslint configuration

This package contains `eslint` configuration to be shared across projects.

---

## Contents

- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Setup

- Install as a dev dependency in packages / apps:

  ```sh
  npm i --save-dev @leather-wallet/eslint-config
  ```

- Add eslint configuration file:

  ```js
  // .eslintrc.js
  module.exports = {
    extends: ['@leather-wallet/eslint-config', 'universe/native'],

    // add this if you have typescript in your package / app
    parserOptions: {
      project: path.resolve(__dirname, './tsconfig.json'),
    },

    ...,
  };
  ```

- Add eslint ignore patterns file:

  ```sh
  # .eslintignore

  !.*
  node_modules/

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
    "lint": "eslint . --config .eslintrc.js",
    "lint:fix": "eslint . --config .eslintrc.js --fix"
    ...
  }
  ```

## Usage

- Manual usage from command line:

  ```sh
  npm run lint
  npm run lint:fix
  ```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
