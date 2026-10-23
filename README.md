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

### Updating pnpm version

To update pnpm, use the helper script which updates all required locations:

```bash
./scripts/update-pnpm-version.sh <version>
```

This updates `.prototools`, `.github/actions/provision/action.yml`, and `package.json` in one command.

### Documentation

Documentation has been provided from the outset and can be found in `docs/tools/` along with a [TEMPLATE.md](docs/core/TEMPLATE.md) file

### Development with extension

To be able to develop packages and test those in extension, check out this [guide](docs/extension-development.md)

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)
