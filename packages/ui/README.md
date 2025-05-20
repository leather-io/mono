# UI

This package contains Leather Wallet's UI library for our web + React Native applications.

## Architecture

This package colocates Web and React Native code, such that commonalities such as shared logic and types are shared. **The naming convention must be followed.**

- `*.web.ts` — bundled only for Web
- `*.native.ts` — bundled only for React Native
- `*.shared.ts` — bundled for all platforms

## Web Setup

Our web apps use [panda css](https://panda-css.com/). To setup in your application you need to:

- Install `@pandacss/dev`
- Setup panda css and configure it to acknowledge the library code
- Configure Webpack to load the files correctly
- Import the library styles from `@leather.io/ui/styles`

### Panda configuration

Specify the library as part of the `panda.config` `include`:

```js
  include: [
    './node_modules/@leather.io/ui/dist-web/**/*.{js,jsx,ts,tsx}',
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

## Security: Dynamic Content Sanitization

All dynamic HTML content rendered in the web app (such as FAQs, explainers, and CMS-driven posts) is sanitized using [DOMPurify](https://github.com/cure53/DOMPurify) via a shared utility (`sanitizeContent`).

- **Browser:** Uses DOMPurify to remove unsafe HTML and prevent XSS.
- **SSR:** Falls back to escaping HTML tags to prevent injection.

This is enforced in all UI components that render user- or CMS-driven HTML, including FAQ, explainer, and post-driven UI elements.

A shared utility, `sanitizeContent`, is used throughout the codebase to sanitize any post content before rendering. Example usage:

```ts
import { sanitizeContent } from '@leather.io/ui/utils/sanitize-content';

const safeHtml = sanitizeContent(post.Summary);
```

This is applied in all FAQ, explainer, hover card, and heading components that render post content.

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---
