import { ruleTester } from '../design-system/rule-tester.js';
import { noBlocksOutsideKernelFilesRule } from './no-blocks-outside-kernel-files.js';

ruleTester.run('no-blocks-outside-kernel-files', noBlocksOutsideKernelFilesRule, {
  valid: [
    { code: "import { witnessStackCodec } from './witness-stack.kernel';" },
    { code: "import type { Format } from '@leather.io/utils/kernel';" },
    { code: "import { type Format, type IntegerFormat } from '@leather.io/utils/kernel';" },
    { code: "import type { CoderType } from 'micro-packed';" },
    { code: "import { sha256 } from '@noble/hashes/sha256';" },
    { code: "import { quantity, settle, sumQuantities } from '@leather.io/utils/kernel';" },
    { code: "import { type Quantity, isSameWebOrigin, webOrigin } from '@leather.io/utils/kernel';" },
  ],
  invalid: [
    {
      code: "import { strictText } from '@leather.io/utils/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { type Format, fields } from '@leather.io/utils/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { decimalAmount, quantity } from '@leather.io/utils/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { integer } from '@leather.io/utils/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import * as P from 'micro-packed';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { type CoderType, U32BE } from 'micro-packed';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import * as kernel from '@leather.io/utils/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
  ],
});
