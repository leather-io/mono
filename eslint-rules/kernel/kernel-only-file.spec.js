import { ruleTester } from '../design-system/rule-tester.js';
import { kernelOnlyFileRule } from './kernel-only-file.js';

ruleTester.run('kernel-only-file', kernelOnlyFileRule, {
  valid: [
    {
      code: `
        import { bytes, compactSize, list } from '@leather.io/kernel';
        export const witnessStackCodec = list(compactSize, bytes(compactSize));
      `,
    },
    {
      code: `
        import { type Codec, constant, text, thenRestAsText, tuple, uint } from '@leather.io/kernel';
        import { hexToBytes } from '@noble/hashes/utils';
        import { segment } from './path.kernel';
        const prefixWidth = 4;
        const u32 = uint(prefixWidth, 'big');
        export type Message = Codec<[undefined, string]>;
        export const message = thenRestAsText(constant(hexToBytes('cafe')));
        export const tagged = tuple(constant(Uint8Array.of(1, 2)), text(u32));
        export const again = segment;
      `,
    },
    {
      code: `
        import { characters, charactersIn, numeral, optionalSuffix, separated } from '@leather.io/kernel';
        const fingerprint = characters(charactersIn('09', 'af'), { minLength: 1, maxLength: 8 });
        export const path = separated('/', optionalSuffix("'", numeral(10)), { minCount: 3 });
      `,
    },
    {
      code: `
        import { fields, numeral } from '@leather.io/kernel';
        export const keyPath = fields('/', ['change', numeral(2, 1)], ['index', numeral(10)]);
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { fields, numeral } from '@leather.io/kernel';
        export const keyPath = fields('/', [nameOf('change'), numeral(2, 1)], ['index', numeral(10)]);
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import { sha256 } from '@noble/hashes/sha256';
        import { constant } from '@leather.io/kernel';
      `,
      errors: [{ messageId: 'onlyKernelImports' }],
    },
    {
      code: `
        import { hexToBytes, utf8ToBytes } from '@noble/hashes/utils';
      `,
      errors: [{ messageId: 'onlyKernelImports' }],
    },
    {
      code: `
        import { uint } from '@leather.io/kernel';
        export function encodeLength(value) { return uint(4, 'big').encode(value); }
      `,
      errors: [{ messageId: 'onlyConstDefinitions' }],
    },
    {
      code: `
        import { uint } from '@leather.io/kernel';
        let width = uint(4, 'big');
      `,
      errors: [{ messageId: 'onlyConstDefinitions' }],
    },
    {
      code: `
        import { uint } from '@leather.io/kernel';
        if (true) uint(4, 'big');
      `,
      errors: [{ messageId: 'onlyConstDefinitions' }],
    },
    {
      code: `
        import { numeral } from '@leather.io/kernel';
        export const parseIndex = text => numeral(10).parse(text);
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import { text, uint } from '@leather.io/kernel';
        export const field = text(uint(isWide ? 8 : 4, 'big'));
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import { constant } from '@leather.io/kernel';
        export const tag = constant(makeTag('v1'));
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import { numeral } from '@leather.io/kernel';
        export const encoded = numeral(10).print(5);
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import { prefixed, numeral } from '@leather.io/kernel';
        export const format = prefixed(\`\${root}/\`, numeral(10));
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
  ],
});
