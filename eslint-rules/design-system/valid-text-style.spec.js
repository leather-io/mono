import { ruleTester } from './rule-tester.js';
import { validTextStyleRule } from './valid-text-style.js';

const options = [{ textStyles: ['heading.05', 'label.02', 'caption.01', 'caption.02'] }];

ruleTester.run('valid-text-style', validTextStyleRule, {
  valid: [
    { code: '<styled.span textStyle="label.02" />', options },
    { code: "css({ textStyle: 'caption.01' })", options },
    { code: "<styled.span textStyle={{ base: 'caption.02', md: 'label.02' }} />", options },
    { code: '<styled.span textStyle={style} />', options },
  ],
  invalid: [
    {
      code: '<styled.h6 textStyle="heading.06" />',
      options,
      errors: [
        {
          message:
            "Use a defined text style (heading.05) instead of 'heading.06' — docs/design/never.md#undefined-text-style",
        },
      ],
    },
    {
      code: '<styled.span textStyle="caption">Available balance:</styled.span>',
      options,
      errors: [{ messageId: 'unknownTextStyle' }],
    },
    {
      code: "css({ textStyle: isLarge ? 'label.02' : 'label.2' })",
      options,
      errors: [{ messageId: 'unknownTextStyle' }],
    },
  ],
});
