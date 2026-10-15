import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

import { noEnumSyntax } from './rules/no-enum.js';

export const sharedRestrictedSyntax = [
  noEnumSyntax,
  {
    selector: "CallExpression[callee.property.name='then']",
    message: 'Use async/await instead of .then().',
  },
  {
    selector: 'CallExpression[callee.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
    message:
      'Do not use an IIFE. Declare a named function and call it, or compute the value with a function.',
  },
  {
    selector:
      ':matches(ReturnStatement, ArrowFunctionExpression) > Literal[value=""], ReturnStatement > ConditionalExpression > Literal[value=""]',
    message:
      'Do not return an empty string as a sentinel. Return undefined or null and let the caller decide.',
  },
  {
    selector:
      ':matches(CallExpression, NewExpression) > LogicalExpression[operator=/^(\\?\\?|\\|\\|)$/][right.type="Literal"][right.value=""]',
    message:
      "Do not pass `x ?? ''` as an argument. Narrow the value first or let the callee accept undefined.",
  },
  {
    selector:
      ':matches(CallExpression, NewExpression) > LogicalExpression[operator=/^(\\?\\?|\\|\\|)$/][right.type="Literal"][right.value=0]',
    message:
      'Do not pass `x ?? 0` as an argument. A missing value is not zero: narrow it first or let the callee accept undefined.',
  },
  {
    selector:
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)[returnType.typeAnnotation.type="TSTypePredicate"][returnType.typeAnnotation.asserts=false]',
    message:
      'Do not declare an explicit type predicate. Let TypeScript infer it, or validate with a schema.',
  },
];

export const sharedRestrictedImportPaths = [
  {
    name: 'lodash.get',
    message: 'Dotted-path reads erase types. Parse the value with a schema instead.',
  },
  {
    name: 'lodash/get',
    message: 'Dotted-path reads erase types. Parse the value with a schema instead.',
  },
];

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
      'no-restricted-syntax': ['error', ...sharedRestrictedSyntax],
      'no-restricted-imports': ['error', { paths: sharedRestrictedImportPaths }],
      'object-shorthand': ['error', 'always', { avoidExplicitReturnArrows: true }],
      'no-duplicate-imports': ['error'],
      'no-fallthrough': 'error',
      'default-case': 'error',
      radix: 'error',
      'no-console': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-meaningless-void-operator': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_' }],
      '@typescript-eslint/no-base-to-string': ['error', { ignoredTypeNames: ['To'] }],
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-type-parameters': 'error',
      '@typescript-eslint/unbound-method': 'off',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-require-imports': 'off', // valid use-case: expo-image
      '@typescript-eslint/no-deprecated': 'off', // Needs decision. We can't have deprecated usages block the integration since we disallow warnings, but we do want to somehow track them.
      'func-style': ['error', 'declaration'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],

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
  }
);
