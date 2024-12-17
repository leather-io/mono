# Leather Mono

The purpose of this monorepo is to provide a single home for core Leather functionality. The monorepo uses [`pnpm` workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turbo.build/repo/docs). Packages are found under `packages/*`. Apps are found under `apps/*`.

## Installation

1. `pnpm i` at the `mono` root
2. Run `pnpm build`

## Architecture

![Leather architecture diagram](https://raw.githubusercontent.com/leather-io/mono/refs/heads/architecture/leather-architecture.svg)

- [Architecture](docs/core/ARCHITECTURE.md)
- [Monorepo](docs/core/MONOREPO.md)

Coding standards are enforced through the use of

- `eslint`
- `prettier`
- `typescript`
- `syncpack`
- `ls-lint`

### Monorepo core packages

The current packages are listed below

- [ESLint](packages/eslint-config/README.md)
- [Prettier](packages/prettier-config/README.md)
- [TSconfig](packages/tsconfig-config/README.md)

## Running code quality checks with git hooks

You can configure code checks to run during pre-commit and/or pre-push hooks. Available checks 
include:

- lint: runs ESLint.
- format: formats code with prettier
- syncpack: ensures consistent dependency versions across packages.
- test: runs the test suite.
- typecheck: validates TypeScript types.

### Set up local checks

1. Copy `.env.example` to `.env`.
2. Define the checks for each hook (default settings shown below):

PRE_COMMIT=format,lint
PRE_PUSH=syncpack,typecheck,lint:filenames

In most cases, setting PRE_COMMIT is sufficient, as syncpack and file name linting errors are
uncommon, and typechecking is handles by editors.

Local checks are optional and configurable to suit developer preferences. On GitHub, these 
checks run automatically on every push through [Code checks](.github/workflows/code-checks.yml), as part of the CI workflow.

### Documentation

Documentation has been provided from the outset and can be found in `docs/tools/` along with a [TEMPLATE.md](docs/core/TEMPLATE.md) file

### Development with extension

To be able to develop packages and test those in extension, check out this [guide](docs/extension-development.md)

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)
