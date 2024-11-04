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

Shared configuration files for these tools exist in `packages` and the same base configurations are used in the monorepo itself.

### Monorepo core packages

The current packages are listed below

- [ESLint](packages/eslint-config/README.md)
- [Prettier](packages/prettier-config/README.md)
- [TSconfig](packages/tsconfig-config/README.md)

### Git Actions

Basic CI actions to run code quality checks have been setup in

- [Code checks](.github/workflows/code-checks.yml)

### Documentation

Documentation has been provided from the outset and can be found in `docs/tools/` along with a [TEMPLATE.md](docs/core/TEMPLATE.md) file

### Development with extension

To be able to develop packages and test those in extension, check out this [guide](docs/extension-development.md)

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)
