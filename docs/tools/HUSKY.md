# Husky configuration

The purpose of the `husky` is to run tasks on certain git actions. Initially it has been setup to run linting tasks on `commit` locally. This helps to ensure high standards and notify developers of failures soon.

It runs on staged files via `lint-staged`. As this is a clean project it is quite fast but as it grows we can consider running husky jobs only on `push`

## Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Prerequisites

- [➡ lint-staged](./LINTSTAGED.md) - lint indexed files before commit
- [➡ commitlint](./COMMITLINT.md) - lint commit messages

## Setup

- Add `pre-commit` hook for linting and formatting indexed files using [lint-staged](./lint-staged.md):

  ```sh
  npx husky add .husky/pre-commit 'run-command-on-pre-commit'
  ```

- Add `commit-msg` hook for linting of commit message using [commitlint](../../packages/commitlint/README.md):

  ```sh
  npx husky add .husky/commit-msg 'run-command-on-commit-msg $1'
  ```

- For more info visit [husky guide](https://typicode.github.io/husky/guide.html)

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)

---

[⬅ Back](../../README.md)

---
