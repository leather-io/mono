# UI

This package contains Leather Wallet's UI library. It is intended for use in applications that are using [panda css](https://panda-css.com/).

# Setup

To setup in your application you need to:

- install panda-css
- setup panda css and configure it to acknowledge the library code
- configure webpack to load the files correctly

## Panda configuration

Specify the library as part of the `panda.config` `include`:

```json
  include: [
    './node_modules/@leather.io/ui/dist-all/src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
```

## Webpack configuration

- Alias `react` and `react-dom` to avoid react errors.

- Configure your `module` to handle `jsx` files

```json
export const config = {
...
  module: {
    resolve: {
    ...
    alias: {
    'leather-styles': path.resolve('leather-styles'),
    'react': path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom')
    },
      ...
    rules: [
      ...
      {
        test: /\.(js)$/,
        include: [/node_modules\/@cteic\/ui/],
        loader: 'esbuild-loader',
        options: { tsconfig: './tsconfig.json', loader: 'jsx',target: 'es2020' },
      },

```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
