import { noMonoAmountRule } from './no-mono-amount.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-mono-amount', noMonoAmountRule, {
  valid: [
    // Addresses and code stay mono.
    { code: '<styled.span textStyle="address">{letterGroup}</styled.span>' },
    { code: '<styled.code textStyle="code">{errorCode}</styled.code>' },
    { code: '<styled.span textStyle="address">{truncateMiddle(address, 4)}</styled.span>' },
    { code: '<AddressDisplayer address={address} textStyle="address" />' },
    // Amounts in Diatype.
    { code: '<styled.span textStyle="label.02">{fee}</styled.span>' },
    { code: '<styled.span textStyle="heading.03">120.00 STX</styled.span>' },
    // tabular-nums is only checked with checkTabular.
    { code: '<styled.span fontVariant="tabular-nums">{value}</styled.span>' },
    {
      code: '<styled.code fontVariant="tabular-nums">{address.replace(".", "\\n.")}</styled.code>',
      options: [{ checkTabular: true }],
    },
  ],
  invalid: [
    {
      code: '<styled.span textStyle="code">{send.totalSpend}</styled.span>',
      errors: [
        {
          message:
            'Use a Diatype text style (label.02 for a value, heading.03 for a hero amount) instead of textStyle="code" on an amount; mono is for full addresses and code — docs/design/never.md#mono-amount',
        },
      ],
    },
    {
      code: '<styled.span textStyle="address">0.0004 STX</styled.span>',
      errors: [{ messageId: 'monoAmount' }],
    },
    {
      code: '<Balance balance={fee} textStyle="code" />',
      errors: [{ messageId: 'monoAmount' }],
    },
    {
      code: '<styled.span fontFamily="Fira Code">{formatCurrency(balance)}</styled.span>',
      errors: [{ messageId: 'monoAmount' }],
    },
    {
      code: '<styled.span textStyle="label.02" fontVariant="tabular-nums">{value}</styled.span>',
      options: [{ checkTabular: true }],
      errors: [{ messageId: 'monoAmount' }],
    },
    {
      code: '<styled.span fontVariantNumeric="tabular-nums">$102.00</styled.span>',
      options: [{ checkTabular: true }],
      errors: [{ messageId: 'monoAmount' }],
    },
  ],
});
