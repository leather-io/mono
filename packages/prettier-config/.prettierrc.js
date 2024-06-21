const defaultConfig = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  arrowParens: 'avoid',
};

export default {
  ...defaultConfig,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^react',
    '<THIRD_PARTY_MODULES>',
    '^@leather\\.io/(.*)$',
    '^@shared/(.*)$',
    '^@(app|content-script|inpage|background)/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
