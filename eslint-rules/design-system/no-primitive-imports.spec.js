import { noPrimitiveImportsRule } from './no-primitive-imports.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-primitive-imports', noPrimitiveImportsRule, {
  valid: [
    { code: "import { BasicTooltip, DropdownMenu } from '@leather.io/ui';" },
    { code: "import { Sheet } from '@leather.io/ui/native';" },
  ],
  invalid: [
    {
      code: "import * as RadixTooltip from '@radix-ui/react-tooltip';",
      errors: [
        {
          message:
            "Use BasicTooltip or Tooltip from @leather.io/ui instead of importing '@radix-ui/react-tooltip' — docs/design/never.md#radix-imports",
        },
      ],
    },
    {
      code: "import { DropdownMenu, Dialog } from 'radix-ui';",
      errors: [
        {
          message:
            "Use DropdownMenu, Sheet from @leather.io/ui instead of importing 'radix-ui' — docs/design/never.md#radix-imports",
        },
      ],
    },
    {
      code: "import { Collapsible } from 'radix-ui';",
      errors: [{ messageId: 'primitiveImport' }],
    },
  ],
});
