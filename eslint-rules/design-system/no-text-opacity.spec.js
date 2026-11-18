import { noTextOpacityRule } from './no-text-opacity.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-text-opacity', noTextOpacityRule, {
  valid: [
    { code: '<styled.span textStyle="caption.01" color="ink.text-subdued">Fee</styled.span>' },
    { code: '<styled.span opacity={isLoading ? 0 : 1}>{children}</styled.span>' },
    { code: '<Box opacity={0.5}><Spinner /></Box>' },
    { code: "css({ bg: 'ink.background-overlay', opacity: 0.4 })" },
    { code: "css({ _hover: { bg: 'red.action-primary-default', color: 'white', opacity: 0.8 } })" },
  ],
  invalid: [
    {
      code: '<styled.span textStyle="label.02" opacity={0.6}>Pending</styled.span>',
      errors: [
        {
          message:
            'Use a step on the ink text ladder (ink.text-secondary, ink.text-subdued or ink.text-non-interactive) instead of opacity on text — docs/design/never.md#text-opacity',
        },
      ],
    },
    {
      code: '<Text variant="caption01" opacity={disabled ? 0.5 : 1}>Max</Text>',
      errors: [{ messageId: 'textOpacity' }],
    },
    {
      code: "<Text style={{ opacity: '60%' }}>Max</Text>",
      errors: [{ messageId: 'textOpacity' }],
    },
    {
      code: "css({ color: 'ink.text-primary', opacity: 0.7 })",
      errors: [{ messageId: 'textOpacity' }],
    },
  ],
});
