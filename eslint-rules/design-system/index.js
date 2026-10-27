// eslint-rules/design-system/index.js
import { noDeadChevronRule } from './no-dead-chevron.js';
import { noLocalDuplicateRule } from './no-local-duplicate.js';
import { noMonoAmountRule } from './no-mono-amount.js';
import { noPrimitiveImportsRule } from './no-primitive-imports.js';
import { noRawColorRule } from './no-raw-color.js';
import { noRawInteractiveRule } from './no-raw-interactive.js';
import { noTextOpacityRule } from './no-text-opacity.js';
import { validTextStyleRule } from './valid-text-style.js';

export const designSystemRules = {
  'valid-text-style': validTextStyleRule,
  'no-raw-color': noRawColorRule,
  'no-raw-interactive': noRawInteractiveRule,
  'no-primitive-imports': noPrimitiveImportsRule,
  'no-text-opacity': noTextOpacityRule,
  'no-local-duplicate': noLocalDuplicateRule,
  'no-mono-amount': noMonoAmountRule,
  'no-dead-chevron': noDeadChevronRule,
};

export const designSystemPlugin = { rules: designSystemRules };
