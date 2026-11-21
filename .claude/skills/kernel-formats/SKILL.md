---
name: kernel-formats
description: Use `@leather.io/kernel` for any byte or text format Leather defines itself. Use when adding or changing code that builds bytes to hash or sign, reads bytes back, or builds or parses a structured string (derivation paths, key origins, descriptors, identifiers), or when tempted to reach for DataView, concatBytes, split, parseInt or a regex for such a format. Covers which block to use, the rules that keep the kernel guarantees valid, how to add a block, and what the kernel does not guarantee.
---

# Kernel formats

`@leather.io/kernel` (`packages/kernel`) holds building blocks whose properties are checked once, by property tests, across random and small combinations. A codec or format built only from those blocks gets the properties without tests of its own for them.

Use it for formats we define. Leave third-party formats to their libraries: transactions and PSBTs to `@scure/btc-signer`, `bitcoinjs-lib` and `@stacks/transactions`, descriptors and miniscript to `@bitcoinerlab/descriptors`, base encodings to `@scure/base`.

## Which block

Bytes (`Codec`, with `encode` and `decode`):

| Job | Block |
| --- | --- |
| Integer of 1 to 8 bytes | `uint(width, 'big' \| 'little')` |
| Bitcoin variable-length integer | `compactSize` |
| Exactly N bytes | `fixedBytes(n)` |
| Bytes or UTF-8 text with a length in front | `bytes(length)`, `text(length)`, where `length` is `uint(…)` or `compactSize` |
| Magic number, version or domain tag | `constant(bytes)` |
| Counted list | `list(count, item)` |
| Two to six parts in a row | `tuple(a, b, …)` |
| Message that ends with whatever is left | `thenRestAsBytes(head)`, `thenRestAsText(head)` |

Text (`Format`, with `print` and `parse`):

| Job | Block |
| --- | --- |
| Number, shortest form | `numeral(10)`, `numeral(16)` |
| Number padded to a width, such as a fingerprint | `numeral(16, 8)` |
| Text limited to a character set and length | `characters(charactersIn('09', 'af'), { minLength, maxLength })`, `charactersExcept('[', ']')` |
| Fixed text in front | `prefixed('m/', inner)` |
| Optional one-character mark at the end | `optionalSuffix("'", inner)` |
| Items with a separator | `separated('/', item, { minCount })` |
| Two parts cut at the first separator | `splitAt(']', first, second)` |
| One part, then any number of further parts | `leading('/', first, rest)` |
| Several named parts with a separator | `fields('/', ['change', a], ['index', b])` |
| Named parts, then any number of further parts | `fieldsThenMore('/', ['purpose', a], ['account', b], ['rest', c])` |

Existing uses to copy from:

- `packages/crypto/src/multisig/proposal-preimage.kernel.ts`: a hashed preimage
- `packages/crypto/src/derivation-path.kernel.ts`: paths, key origins and descriptors, used by `derivation-path-utils.ts`
- `packages/bitcoin/src/utils/witness-stack.kernel.ts`: a counted list of length-prefixed items
- `apps/web/app/features/multisig/transactions/signing/substitute-stx-nonce.kernel.ts`: a prefix followed by the rest; the caller decodes, changes one field and encodes again

## Rules

1. **Define the codec or format in a `*.kernel.ts` file, as a top-level `const` built only from kernel blocks.** The guarantee covers that expression and nothing else. Such a file may hold only kernel imports, other codec or format imports, literals and those `const` definitions; code that uses the result lives in a normal file and imports it.
2. **Keep logic out of the format.** Do not slice, pad, split, concatenate or convert bytes or text by hand before `encode` or after `parse`. Give each part you need a name in the format with `fields` or `fieldsThenMore` and read it by that name, so there is no position to count, no index that can be out of range and no check left to write. See `packages/crypto/src/derivation-path.kernel.ts`.
3. **Start anything hashed or signed with a `text` or `constant` naming the protocol and version.** Two different layouts can share an encoding; a tag in front prevents that.
4. **Keep a layout fixed once it ships.** Changing field order, width or byte order changes every hash. Pin the current bytes with a fixed-vector test.
5. **Do not work around a missing block.** If a format cannot be expressed, add a block to the kernel or leave the code as plain TypeScript with tests.
6. **Do not catch a kernel error and continue with a guess.** If invalid input is expected, return `undefined` and let the caller decide.

Three lint rules in `eslint-rules/kernel` enforce this, so fix the code rather than the rule:

- `kernel/kernel-only-file`: a `*.kernel.ts` file contains nothing but kernel definitions, and has a spec beside it (`x.kernel.spec.ts`) with a fixed vector for each definition.
- `kernel/no-blocks-outside-kernel-files`: kernel blocks are imported only in those files. Importing a kernel type elsewhere is fine.
- `kernel/no-hand-rolled-encoding`: no `DataView`, `TextEncoder`, `TextDecoder`, `parseInt`, `concatBytes` or `utf8ToBytes` in any package. `packages/ui` and `packages/utils` may use `parseInt` for amounts, and `packages/features` may use `TextEncoder`. In the apps only `DataView` and `concatBytes` are banned.

A constant needs literal bytes: `Uint8Array.of(…)` or `hexToBytes('…')` from `@noble/hashes/utils`. If the bytes are derived (a hash of a tag, say), write the result as a literal and pin it with a test that recomputes it.

A format refuses to be built when a part could contain the delimiter that follows it ("The part before a delimiter must not be able to contain it"). Fix the character set or pick another separator; do not work around it.

## What to test in the caller

The kernel already tests round trips, rejection of malformed input and unambiguity. In the package that uses a codec or format, test only what the kernel cannot know:

- a fixed vector that pins the layout
- which field means what (for example, that the third segment is the account index)
- the choices specific to this format: allowed characters, minimum counts, required prefix
- any logic of your own around the call

## What the kernel does not guarantee

- That the layout is the right one for the protocol.
- Anything about code around the codec or format.
- That two different codecs never produce the same bytes.
- That a property holds for every input. The properties are tested on many generated and small inputs, not proved.
- Anything about what gets signed, what the user is shown, amounts, fees or state.

Parsing is strict. Replacing hand-written `split` and `parseInt` code with a kernel format rejects input the old code tolerated (`007`, `12abc`, wrong case, missing brackets). Check callers and saved data before switching, and give a shipped migration its own frozen copy of the old parsing instead of changing its behaviour.

## Adding a block

Only when a real function needs it. In this order, inside `packages/kernel`:

1. **TypeScript**: add the constructor to `codec.ts` or `format.ts`. Byte blocks wrap `micro-packed`; check that the library's block is strict (one encoding per value, nothing silently repaired) before exposing it. Keep the class private so nothing outside the kernel can construct a codec or format.
2. **Generators**: add the block to the random generators and to the small-case enumeration in the spec, so the general properties (round trip, canonical, injective) cover it.
3. **Its own property**: add a property that states what the block writes and reads, plus a few fixed examples of its exact output.
4. **Mutation gate**: add several deliberate breakages of the new code (wrong byte order, missing bound, skipped check) to `tools/src/kernel/kernel-mutants.ts`. `pnpm lt kernel mutation-gate` applies each one and fails unless the tests notice it. It also fails when an entry no longer matches the code, so update the list when you change the lines it targets.
5. **README**: add the block and what is tested about it.

## Commands

`pnpm --filter @leather.io/kernel test:unit` runs the kernel's fixed examples and property tests.

`pnpm kernel:test-rules` from the repo root runs the tests of the three lint rules.

`pnpm lt kernel mutation-gate` from the repo root runs the mutation gate. It takes a few minutes. CI runs it in `.github/workflows/packages:kernel-checks.yml`.

After changing a caller, run the repo verification from `CLAUDE.md` as usual.
