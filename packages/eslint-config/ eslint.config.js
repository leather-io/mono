// @ts-check
import eslint from '@eslint/js';
import deprecated from 'eslint-plugin-deprecation';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react/configs/recommended.js';
import tseslint from 'typescript-eslint';

const avoidWindowOpenMsg = 'Use `openInNewTab` helper';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: [
      '!.*',
      '**/node_modules/',
      'pnpm-lock.yaml',
      '.commitlintrc.js',
      '.prettierrc.js',
      '**/dist',
      '**/*.d.ts',
    ],
    plugins: {
      // Plugin has type error
      // @ts-ignore
      react,
      reactHooks,
      // Disabled until
      // https://github.com/gund/eslint-plugin-deprecation/pull/79 is merged
      // deprecated,
    },
    rules: {
      // This rule helps highlight areas of the code that use deprecated
      // methods, such as implicit use of signed transactions
      // 'deprecation/deprecation': 'warn',
      'no-console': ['error'],
      'prefer-const': [
        'error',
        {
          ignoreReadBeforeAssign: false,
        },
      ],
      'no-restricted-globals': ['error', { name: 'open', message: avoidWindowOpenMsg }],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'open',
          message: avoidWindowOpenMsg,
        },
        {
          object: 'globalThis',
          property: 'open',
          message: avoidWindowOpenMsg,
        },
        {
          object: 'window',
          property: 'close',
          message: 'Use `closeWindow` utility helper',
        },
      ],
      '@typescript-eslint/no-floating-promises': ['warn'],
      '@typescript-eslint/no-unnecessary-type-assertion': ['warn'],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-assignment': [0],
      '@typescript-eslint/no-unsafe-return': [0],
      '@typescript-eslint/no-unsafe-call': [0],
      '@typescript-eslint/no-unsafe-member-access': [0],
      '@typescript-eslint/restrict-template-expressions': [0],
      '@typescript-eslint/explicit-module-boundary-types': [0],
      '@typescript-eslint/no-unnecessary-type-constraint': ['off'],
      '@typescript-eslint/no-non-null-asserted-optional-chain': ['off'],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/ban-types': ['error'],
      // This rule is off until we can enable tsconfig noUncheckedIndexedAccess
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': ['error'],
      'no-warning-comments': [0],

      // Awaiting update
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': ['error'],

      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  }
);

// 'plugin:react/recommended',
// 'plugin:react/jsx-runtime',
// 'plugin:react-hooks/recommended',
// ],

// plugins: [/*'react', 'react-hooks', */ '@typescript-eslint', 'deprecation'],

// },
//   overrides: [
//     {
//       files: ['test/**', 'src/**/*.spec.ts'],
//       rules: {
//         'no-console': [0],
//       },
//     },
//     {
//       files: ['src/**/*'],
//       excludedFiles: 'src/app/store/**',
//       rules: {
//         'no-restricted-imports': [
//           'error',
//           {
//             paths: [
//               {
//                 name: 'react-redux',
//                 importNames: ['useSelector'],
//                 message: 'Selectors must be expored from the store via a hook',
//               },
//               {
//                 name: '@radix-ui/themes',
//                 importNames: ['Flex'],
//                 message: 'Layout components should be imported from leather-styles/jsx',
//               },
//             ],
//           },
//         ],
//       },
//     },
//   ],
