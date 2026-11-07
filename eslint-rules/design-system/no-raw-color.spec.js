import { noRawColorRule } from './no-raw-color.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-raw-color', noRawColorRule, {
  valid: [
    { code: '<Box bg="ink.background-secondary" color="ink.text-primary" />' },
    { code: "css({ border: '1px solid {colors.ink.border-default}' })" },
    { code: '<a href="#faded">Jump</a>' },
    { code: "const anchor = '#fff';" },
    { code: "<Box data-color='#fff' />" },
    { code: '<Box boxShadow="0px 8px 16px rgba(27, 39, 51, 0.08)" />' },
    { code: '<PlaygroundArea description="Design record for issue #2643" />' },
    { code: "css({ WebkitMask: 'linear-gradient(-60deg, #000 30%, #0005, #000 70%)' })" },
  ],
  invalid: [
    {
      code: '<Box bg="#F9F9F8" />',
      errors: [
        {
          message:
            "Use a semantic colour token (ink.*, red.*, green.*, yellow.*, blue.*) instead of the raw value '#F9F9F8' — docs/design/never.md#raw-colour",
        },
      ],
    },
    {
      code: "css({ boxShadow: '0px 12px 24px 0px rgba(18, 16, 15, 0.08)' })",
      options: [{ checkShadows: true }],
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: "const styles = StyleSheet.create({ row: { borderColor: '#E5E3E1' } });",
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: '<Box borderLeft="1px solid #DCDDE2" />',
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: "<LinearGradient colors={['#FFFFFF00', colors.blue]} />",
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: "const shadow = { shadowColor: 'hsl(20 10% 5%)' };",
      errors: [{ messageId: 'rawColor' }],
    },
  ],
});
