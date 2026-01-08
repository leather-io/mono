import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'prefer-const': ['error', { ignoreReadBeforeAssign: false }],
      'no-nested-ternary': 'error',
      'no-duplicate-imports': ['error'],
      'no-fallthrough': 'error',
      'default-case': 'error',
      radix: 'error',
      'no-console': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_' }],
      '@typescript-eslint/no-base-to-string': ['error', { ignoredTypeNames: ['To'] }],
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-require-imports': 'off', // valid use-case: expo-image
      '@typescript-eslint/no-deprecated': 'off', // Needs decision. We can't have deprecated usages block the integration since we disallow warnings, but we do want to somehow track them.
      'func-style': ['error', 'declaration'],

      // eslint rules moved from extension
      '@typescript-eslint/no-floating-promises': ['error'],
      '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
      // '@typescript-eslint/explicit-module-boundary-types': [0],
      // '@typescript-eslint/no-unnecessary-type-constraint': ['off'],
      // '@typescript-eslint/no-non-null-asserted-optional-chain': ['off'],
      // '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      // 'no-warning-comments': [0],
    },
  },
  {
    name: 'Rules that should be enabled',
    // The rules below are temporarily disabled until the related code is updated.
    // Some are intentionally duplicated from the rule list above for easier deletion after addressing.
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/consistent-type-imports': 'off', // --fix-able
    },
  }
);
