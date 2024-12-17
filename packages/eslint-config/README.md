# Shared eslint configuration

This package provides shared `eslint` configurations with eslint 9 flat config. It includes two
presets:

* `base` - A standard configuration for TypeScript projects at Leather.
* `react` - An additional setup for React projects to use with `base`.

---

## Contents

- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Setup

### Inside @leather.io/mono

You don’t need to install or link this package within monorepo packages. The base config 
will be applied to all packages and apps by default. To add custom configurations (e.g., React) for a new 
package or app, add a new configuration object into `eslint-config.js` file at the root of the 
monorepo:

```js
export default tseslint.config(
  {...existingConfigs},
  {
    name: 'your-new-package-name',
    files: ['packages/your-package-path/src/**/*.{ts,tsx}'],
    extends: [reactConfig],
    rules: {
      // additional rules for the package
    }
  }
)
```

### In external repositories

1. Install the package:

```sh
npm install --save-dev @leather.io/eslint-config
```

2. Make sure all peer dependencies for this package are installed in your repository as 
   devDependencies. The list of dependencies can be found [here](https://github.com/leather-io/mono/blob/dev/packages/eslint-config/package.json) 
   or by running the following command:

```sh
npm info "@leather.io/eslint-config@latest" peerDependencies

```

3. Configure `eslint.config.js`:
   
```js
import { baseConfig, reactConfig } from '@leather.io/eslint-config';

export default [
  ...baseConfig,
  ...reactConfig, // Add for React projects
];
```

## Usage

Refer to [Running code quality checks with git hooks](../../README.md#running-code-quality-checks-with-git-hooks)
for information on how checks are run in the monorepo.

Outside the monorepo, add an npm script in `package.json` to run `eslint`, e.g.:
`"lint": "eslint"`.

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
