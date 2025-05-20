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

Configure code checks to run during pre-commit and/or pre-push hooks. Each check maps directly to a script in the root package.json.

1. Copy `.env.example` to `.env`.
2. Enable specific checks for each hook::

```
PRE_COMMIT=format,lint
PRE_PUSH=syncpack:lint,typecheck,lint:filenames
```

In most cases, setting PRE_COMMIT is sufficient, as errors from remaining checks are
uncommon, and typechecking is handled by editors.

Local checks are optional and configurable to suit developer preferences. On GitHub, these 
checks run automatically on every push through [Code checks](.github/workflows/code-checks.yml), as part of the CI workflow.

### Documentation

Documentation has been provided from the outset and can be found in `docs/tools/` along with a [TEMPLATE.md](docs/core/TEMPLATE.md) file

### Development with extension

To be able to develop packages and test those in extension, check out this [guide](docs/extension-development.md)

## License

[MIT](LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

## Security: Dynamic Content Sanitization

All dynamic HTML content rendered in the web app (such as FAQs, explainers, and CMS-driven posts) is sanitized using [DOMPurify](https://github.com/cure53/DOMPurify) via a shared utility (`sanitizeContent`).

- **Browser:** Uses DOMPurify to remove unsafe HTML and prevent XSS.
- **SSR:** Falls back to escaping HTML tags to prevent injection.

This is enforced in all UI components that render user- or CMS-driven HTML, including FAQ, explainer, and post-driven UI elements.

A shared utility, `sanitizeContent`, is used throughout the codebase to sanitize any post content before rendering. Example usage:

```ts
import { sanitizeContent } from '~/app/utils/sanitize-content';

const safeHtml = sanitizeContent(post.Summary);
```

This is applied in all FAQ, explainer, hover card, and heading components that render post content.

