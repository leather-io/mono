import { noLocalDuplicateRule } from './no-local-duplicate.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-local-duplicate', noLocalDuplicateRule, {
  valid: [
    { code: "import { BasicTooltip } from '@leather.io/ui';" },
    { code: "import { InfoTooltip } from '@app/ui/components/tooltip/info-tooltip';" },
  ],
  invalid: [
    {
      code: "import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';",
      errors: [
        {
          message:
            "Use BasicTooltip or Tooltip from @leather.io/ui instead of the local copy '@app/ui/components/tooltip/basic-tooltip' — docs/design/never.md#local-duplicates",
        },
      ],
    },
    {
      code: "import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';",
      options: [
        {
          duplicates: [
            {
              pattern: '^@app/common/hooks/use-copy-to-clipboard$',
              replacement: 'useClipboard from @leather.io/ui',
            },
          ],
        },
      ],
      errors: [{ messageId: 'localDuplicate' }],
    },
  ],
});
