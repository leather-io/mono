import type { Rule } from 'eslint';

export declare const designSystemRules: Record<
  | 'valid-text-style'
  | 'no-raw-color'
  | 'no-raw-interactive'
  | 'no-primitive-imports'
  | 'no-text-opacity'
  | 'no-local-duplicate'
  | 'no-mono-amount'
  | 'no-dead-chevron',
  Rule.RuleModule
>;

export declare const designSystemPlugin: { rules: typeof designSystemRules };
