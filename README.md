# Monorepo Setup

The purpose of this configuration is to ensure strict coding standards and facilitate code sharing. The monorepo uses `npm workspaces` and `nx` at its core and provides several shared packages to be found under the `packages/` and `apps/` folders.

### Monorepo setup

- [Architecture](docs/core/ARCHITECTURE.md)
- [Monorepo](docs/core/MONOREPO.md)

Coding standards are enforced through the use of

- `eslint`
- `prettier`
- `typescript`

Shared configuration files for these tools exist in `packages/` and the same base configurations are used in the monorepo itself.

Some other configured tools are:

- [Husky](docs/tools/HUSKY.md): run code checks and enforce standards locally as a first prevention
- [CommitLint](docs/tools/COMMITLINT.md) enforce [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) standard

### Monorepo packages

The current packages are listed below:

- [ESLint](packages/eslint-config/README.md)
- [Prettier](packages/prettier-config/README.md)
- [TSconfig](packages/tsconfig-config/README.md)

### Monorepo apps

Main applications of the monorepo:

- [Mobile wallet](apps/mobile-wallet/README.md)

### Git Actions

- [Code checks](.github/workflows/ci.yml)
- [Deployment](.github/workflows/deploy.yml)

### Documentation

Documentation has been provided from the outset and can be found in `docs/tools/` along with a [TEMPLATE.md](docs/core/TEMPLATE.md) file

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-wallet/mono)
