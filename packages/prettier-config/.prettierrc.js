// stacks prettier config
const defaultConfig =  {
  printWidth: 100,
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,
  semi: true,
  trailingComma: "es5",
  singleQuote: true,
  arrowParens: 'avoid'
}

module.exports = {
  ...defaultConfig,
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '^react',
    '<THIRD_PARTY_MODULES>',
    '^@shared/(.*)$',
    '^@(app|content-script|inpage|background)/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};