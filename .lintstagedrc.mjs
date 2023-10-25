export default {
  //   '*.md': ['pnpm remark:fix', 'pnpm format:fix'],
  '*.{mjs,js,ts,tsx,json,yaml}': 'pnpm lint:prettier',
  '*.{mjs,js,ts,tsx}': 'pnpm lint:eslint',
};
