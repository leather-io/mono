export default {
  '*.{mjs,js,ts,tsx,json,yaml}': 'pnpm lint:prettier',
  '*.{mjs,js,ts,tsx}': 'pnpm lint:eslint',
};
