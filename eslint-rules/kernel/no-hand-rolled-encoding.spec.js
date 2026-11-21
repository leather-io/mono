import { ruleTester } from '../design-system/rule-tester.js';
import { noHandRolledEncodingRule } from './no-hand-rolled-encoding.js';

ruleTester.run('no-hand-rolled-encoding', noHandRolledEncodingRule, {
  valid: [
    { code: "import { sha256 } from '@noble/hashes/sha256';" },
    { code: "import { bytesToHex, hexToBytes } from '@noble/hashes/utils';" },
    { code: 'const index = Number(text);' },
    { code: 'const view = makeDataView(bytes);' },
    { code: "import { proposalPreimageCodec } from './proposal-preimage.kernel';" },
    { code: 'const amount = parseInt(input, 10);', options: [{ allow: ['parseInt'] }] },
    {
      code: 'const bytes = new TextEncoder().encode(url);',
      options: [{ allow: ['TextEncoder', 'TextDecoder', 'utf8ToBytes'] }],
    },
  ],
  invalid: [
    {
      code: 'new DataView(buffer).setUint32(0, value, false);',
      errors: [
        {
          message:
            'Do not use DataView here. Use uint(width, endian) or another @leather.io/kernel codec, defined in a *.kernel.ts file. See the kernel-formats skill.',
        },
      ],
    },
    {
      code: "const text = new TextDecoder('utf-8').decode(bytes);",
      errors: [{ messageId: 'useKernel' }],
    },
    { code: 'const bytes = new TextEncoder().encode(text);', errors: [{ messageId: 'useKernel' }] },
    { code: 'const index = parseInt(segment, 10);', errors: [{ messageId: 'useKernel' }] },
    { code: 'const index = Number.parseInt(segment, 10);', errors: [{ messageId: 'useKernel' }] },
    {
      code: "import { concatBytes, utf8ToBytes } from '@noble/hashes/utils';",
      errors: [{ messageId: 'useKernel' }, { messageId: 'useKernel' }],
    },
    {
      code: "import { concatBytes, utf8ToBytes } from '@noble/hashes/utils';",
      options: [{ allow: ['utf8ToBytes'] }],
      errors: [
        {
          messageId: 'useKernel',
          data: {
            name: 'concatBytes',
            replacement: 'tuple(…) or another @leather.io/kernel codec',
          },
        },
      ],
    },
  ],
});
