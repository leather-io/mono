import { getWebTextVariants } from '../../packages/tokens/dist/index.js';
import { designSystemPlugin } from './index.js';

export const designRules = {
  'design-system/no-raw-color': 'error',
  'design-system/no-text-opacity': 'error',
  'design-system/valid-text-style': ['error', { textStyles: Object.keys(getWebTextVariants()) }],
  'design-system/no-mono-amount': ['error', { checkTabular: true }],
  'design-system/no-raw-interactive': 'error',
  'design-system/no-primitive-imports': 'error',
  'design-system/no-dead-chevron': 'error',
};

export const toolkitDesignConfig = {
  name: 'design-toolkit-owned-surfaces',
  files: [
    'apps/web/app/pages/playground/shared/recipes/**/*.{ts,tsx}',
    'apps/web/app/pages/playground/areas/recipes/**/*.{ts,tsx}',
    'apps/web/app/pages/playground/areas/receive-example/**/*.{ts,tsx}',
  ],
  plugins: { 'design-system': designSystemPlugin },
  rules: designRules,
};
