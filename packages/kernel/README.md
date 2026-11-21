# `@leather.io/kernel`

Building blocks for byte and text formats, checked by property tests. Code assembled only from these blocks gets the properties below without tests of its own for them.

## Codecs

A codec turns a value into bytes and reads it back. You describe one by combining blocks; you never write the byte handling yourself.

```ts
import { bytes, compactSize, list, text, tuple, uint } from '@leather.io/kernel';

const u32 = uint(4, 'big');

const proposalPreimage = tuple(text(u32), text(u32), bytes(u32), uint(8, 'big'));
const witnessStack = list(compactSize, bytes(compactSize));

const encoded = proposalPreimage.encode([tag, address, payload, timestamp]);
const items = witnessStack.decode(serializedWitness);
```

| Block                 | Value        | Bytes                                                                    |
| --------------------- | ------------ | ------------------------------------------------------------------------ |
| `uint(width, endian)` | `number`     | `width` bytes (1 to 8), big- or little-endian                            |
| `compactSize`         | `number`     | Bitcoin's variable-length integer, shortest form only                    |
| `fixedBytes(length)`  | `Uint8Array` | exactly `length` bytes                                                   |
| `bytes(length)`       | `Uint8Array` | the byte length, written with the integer block `length`, then the bytes |
| `text(length)`        | `string`     | the UTF-8 byte length, then the UTF-8 bytes                              |
| `constant(bytes)`     | `undefined`  | the given bytes, for a magic number or version tag                       |
| `list(count, item)`   | array        | the item count, then each item                                           |
| `tuple(a, b, …)`      | tuple        | two to six parts, one after another                                      |

A message can end with everything that is left, with no length in front: `thenRestAsBytes(head)` or `thenRestAsText(head)`. The result is a message codec, not a codec, so it cannot be nested inside a list or tuple.

Numbers are non-negative safe integers. `encode` throws on a value its codec cannot hold, and `decode` throws on bytes that are not exactly what `encode` would write.

### What is tested

`src/codec/codec.spec.ts` checks these on every codec up to a small size and on random codecs, values and damaged bytes beyond that:

| Property    | In plain words                                                                      |
| ----------- | ----------------------------------------------------------------------------------- |
| round trip  | Decoding what was encoded returns the same value.                                   |
| canonical   | Decoding accepts only the bytes encoding would write.                               |
| injective   | Two values share an encoding only when they are equal.                              |
| prefix-free | No encoding is the start of another, and no encoding takes extra bytes.             |
| layout      | Each block writes what its row in the table above says, checked block by block.     |
| typed layer | `tuple`, `list` and the message codecs put their parts in order and read them back. |

Messages that end with the rest of the bytes are checked the same way. Fixed examples in the same file pin exact bytes.

These are tests, not proofs. A property holds for the inputs that were tried, not for all inputs.

### What you do not get

- Proof that a codec is the right one for your protocol. Field order and types are your choice.
- Anything about code around the codec. A function that adds its own branching or byte handling before or after is outside the guarantee.
- Injectivity across different codecs. Start a hashed or signed layout with a `text` or `constant` naming the protocol and version.

## Text formats

A format turns a value into text and reads it back, with `print` and `parse`. It works the same way as a codec.

| Block                                          | Value                | Text                                                              |
| ---------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `numeral(base, width?)`                        | `number`             | digits in base 2 to 16, zero-padded if a width is given           |
| `characters(set, limits)`                      | `string`             | text from a character set, within a length range                  |
| `prefixed(text, inner)`                        | inner's value        | fixed text, then the inner format                                 |
| `optionalSuffix(mark, inner)`                  | `[value, boolean]`   | the inner format, then the mark or nothing                        |
| `separated(separator, item, limits)`           | array                | one or more items with a separator between them                   |
| `splitAt(separator, first, second)`            | `[first, second]`    | two parts, cut at the first separator                             |
| `leading(separator, first, rest)`              | `[first, rest[]]`    | one part, then any number of further parts                        |
| `fields(separator, [name, format], …)`         | object keyed by name | two to seven named parts with a separator between them            |
| `fieldsThenMore(separator, …, [name, format])` | object keyed by name | named parts, then any number of further parts under the last name |

`fields` and `fieldsThenMore` add no new text forms. They give names to parts that `splitAt` and `leading` would return by position.

A part that is followed by a separator must not be able to contain that separator. The constructors refuse a format that breaks this, which is what keeps parsing unambiguous.

`src/format/format.spec.ts` checks, on every small format and on random ones: parsing what was printed returns the same value, printing what was parsed returns the same text, and each block prints what its row in the table above says.

## Adding a block

1. Add the block to `codec.ts` or `format.ts`.
2. Add it to the generators in the spec file, so the general properties cover it.
3. Add a property that states what the block writes, and fixed examples for its exact output.

## Running the checks

```bash
pnpm test:unit
```
