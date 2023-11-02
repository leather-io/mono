# Shared commitlint configuration

The purpose of `commitlint` is to lint commit messages and make sure they adhere to [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) standards.

Acceptable format examples are:

```js
type(scope?): subject
fix(package): fix bug in package
chore(eslint-config): add new rule
chore: fix the monorepo ci job
```

`commitlint` is used locally only as a first prevention of errors. The CI will also catch these errors in a job run in [Code checks](../../.github/workflows/code-checks.yml) where the `wagoid/commitlint-github-action@v4` job is used.

Checking locally improves developer experience as it provides quick feedback on mistakes

---

## Contents

- [Setup](#setup)
- [Automation](#automation)
- [Usage](#usage)
- [License](#license)

## Setup

- Add workspace reference to `@muravjev/configs-commitlint` and its peer dependencies:

  ```sh
  pnpm add -w @commitlint/cli -D
  ```

- Add commitlint configuration file:

  ```js
  // .commitlintrc.js

  module.exports = require('@commitlint/config-conventional');
  ```

## Automation

- Setup [➡ husky](../../docs/tools/husky.md) to schedule `commitlint` execution on commit.

## Usage

- **Automatic** validation of commit message with `commitlint` on commit.\
  In case of invalid message, commit will be rejected.

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
