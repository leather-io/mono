# UI

This package contains Leather Wallet's UI library for our web + React Native applications.

## Web Setup

Our web apps use [panda css](https://panda-css.com/). To setup in your application you need to:

- install panda-css
- setup panda css and configure it to acknowledge the library code
- configure webpack to load the files correctly

### Panda configuration

Specify the library as part of the `panda.config` `include`:

```js
  include: [
    './node_modules/@leather.io/ui/dist-all/src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
```

### Webpack configuration

- Alias `react` and `react-dom` to avoid react errors.

- Configure your `module` to handle `jsx` files

```js
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
        include: [/node_modules\/@leather.io\/ui/],
        loader: 'esbuild-loader',
        options: { tsconfig: './tsconfig.json', loader: {'jsx'},target: 'es2020' },
      },

```

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
