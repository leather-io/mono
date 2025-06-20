import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    name: 'hooks',
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },

  {
    rules: {
      'react/function-component-definition': 'error',
      'react/prop-types': 'off',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }],
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    settings: {
      react: {
        version: '18.2.0',
      },
    },
  },
];
