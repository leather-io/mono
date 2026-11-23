import { ruleTester } from '../design-system/rule-tester.js';
import { noBlocksOutsideKernelFilesRule } from './no-blocks-outside-kernel-files.js';

ruleTester.run('no-blocks-outside-kernel-files', noBlocksOutsideKernelFilesRule, {
  valid: [
    { code: "import { witnessStackCodec } from './witness-stack.kernel';" },
    { code: "import type { Codec } from '@leather.io/kernel';" },
    { code: "import { type Codec, type Format } from '@leather.io/kernel';" },
    { code: "import { sha256 } from '@noble/hashes/sha256';" },
    { code: "import { quantity, settle, sumQuantities } from '@leather.io/kernel';" },
    { code: "import { type Quantity, isSameWebOrigin, webOrigin } from '@leather.io/kernel';" },
  ],
  invalid: [
    {
      code: "import { uint } from '@leather.io/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { type Codec, tuple } from '@leather.io/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { decimalAmount, quantity } from '@leather.io/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import { integer } from '@leather.io/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
    {
      code: "import * as kernel from '@leather.io/kernel';",
      errors: [{ messageId: 'defineInKernelFile' }],
    },
  ],
});
