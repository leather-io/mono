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
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  // github.com/prettier/prettier/issues/15956#issuecomment-1987146114
  overrides: [
    {
      files: ['*.jsonc', '.eslintrc', 'tsconfig*.json'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
