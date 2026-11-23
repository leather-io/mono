import { ruleTester } from '../design-system/rule-tester.js';
import { kernelOnlyFileRule } from './kernel-only-file.js';

ruleTester.run('kernel-only-file', kernelOnlyFileRule, {
  valid: [
    {
      code: `
        import { decimalAmount, integer } from '@leather.io/kernel';
        export const btcAmount = decimalAmount(8, { bits: 64 });
        export const uint128 = integer({ bits: 128 });
      `,
    },
    {
      code: `
        import * as P from 'micro-packed';
        import { strictText } from '@leather.io/kernel';
        export const preimage = P.tuple([
          strictText(P.U32BE),
          P.bytes(P.U32BE),
          P.apply(P.U64BE, P.coders.numberBigint),
          P.bytes(null),
        ]);
        export const header = P.struct({ version: P.U8, tag: P.magicBytes(Uint8Array.of(1, 2)) });
      `,
    },
    {
      code: `
        import { type CoderType, U32BE, bytes, magicBytes, tuple } from 'micro-packed';
        import { strictText } from '@leather.io/kernel';
        import { hexToBytes } from '@noble/hashes/utils';
        import { segment } from './path.kernel';
        const tagLength = 4;
        export type Message = CoderType<[undefined, string]>;
        export const message = tuple([magicBytes(hexToBytes('cafe')), strictText(null)]);
        export const tagged = tuple([bytes(tagLength), strictText(U32BE)]);
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
        import { numeral } from '@leather.io/kernel';
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
        import { U32BE } from 'micro-packed';
        export function encodeLength(value) { return U32BE.encode(value); }
      `,
      errors: [{ messageId: 'onlyConstDefinitions' }],
    },
    {
      code: `
        import { numeral } from '@leather.io/kernel';
        let width = numeral(10);
      `,
      errors: [{ messageId: 'onlyConstDefinitions' }],
    },
    {
      code: `
        import { numeral } from '@leather.io/kernel';
        if (true) numeral(10);
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
        import * as P from 'micro-packed';
        export const field = P.bytes(isWide ? 8 : 4);
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import * as P from 'micro-packed';
        export const tag = P.magicBytes(makeTag('v1'));
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
    {
      code: `
        import * as P from 'micro-packed';
        export const name = P.string(P.U32BE);
      `,
      errors: [{ messageId: 'useStrictText' }],
    },
    {
      code: `
        import { cstring } from 'micro-packed';
        export const name = cstring;
      `,
      errors: [{ messageId: 'useStrictText' }, { messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import * as P from 'micro-packed';
        export const encoded = P.U32BE.encode(5);
      `,
      errors: [{ messageId: 'onlyKernelBlocks' }],
    },
    {
      code: `
        import P from 'micro-packed';
      `,
      errors: [{ messageId: 'onlyKernelImports' }],
    },
  ],
});
