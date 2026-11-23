# `@leather.io/kernel`

Building blocks for text formats, strict text in bytes, amounts and origins, checked by property tests. Code assembled only from these blocks gets the properties below without tests of its own for them.

## Bytes

Byte layouts are written with [`micro-packed`](https://github.com/paulmillr/micro-packed) directly, in a `*.kernel.ts` file. The kernel adds one block, for the one thing the library leaves loose:

| Block                | Value    | Bytes                                                                             |
| -------------------- | -------- | --------------------------------------------------------------------------------- |
| `strictText(length)` | `string` | the UTF-8 byte length, then the UTF-8 bytes; with `null`, everything that is left |

```ts
import * as P from 'micro-packed';

import { strictText } from '@leather.io/kernel';

export const proposalPreimage = P.tuple([
  strictText(P.U32BE),
  strictText(P.U32BE),
  P.bytes(P.U32BE),
  P.apply(P.U64BE, P.coders.numberBigint),
]);
```

`micro-packed`'s own `string` and `cstring` turn invalid UTF-8 into U+FFFD, write lone surrogates and drop a leading byte order mark, so two different inputs can share a hash. `strictText` refuses all three. `src/text/strict-text.spec.ts` checks that text is written exactly when it has no lone surrogate, that bytes are read exactly when they are valid UTF-8, and that both directions round trip.

The library itself is trusted and not re-tested here. Two things it does not do for you:

- A list of items that take no bytes is not refused.
- Start a hashed or signed layout with `magicBytes` or a `strictText` naming the protocol and version, since two different layouts can share an encoding.

## Text formats

A format turns a value into text and reads it back, with `print` and `parse`. You describe one by combining blocks; you never write the text handling yourself.

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

## Whole numbers and amounts

Both are defined once in a `*.kernel.ts` file, like a codec or format, and work on `bigint`, never on a JavaScript number.

| Block                               | Text                                            | Value                                           |
| ----------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `integer({ bits })`                 | plain decimal digits, no sign, no leading zeros | `bigint` from 0 to 2^bits − 1                   |
| `decimalAmount(decimals, { bits })` | `"1.5"`                                         | base units, such as `150000000n` for 8 decimals |

```ts
export const btcAmount = decimalAmount(8, { bits: 64 });

btcAmount.parse('1.5'); // 150000000n
btcAmount.print(150000000n); // '1.5'
```

- `parse` accepts only the text `print` would write, so each value has one text.
- `decimalAmount(...).read` is for what a person typed: it also accepts trailing zeros (`"1.50"`), and nothing else.
- `integer(...).read` is for a parameter from a dapp or an API: a canonical string, a safe whole number or a `bigint`. It refuses `""`, `null`, `true`, `1.5`, `"0x10"`, `"1e3"` and negatives instead of coercing them.

## Quantities

A quantity is a non-negative `bigint` with a unit name. Import these directly where the arithmetic happens.

```ts
const fee = quantity('sat/vB', 10n).times(quantity('vB', 141n), 'sat');
const change = settle('sat', inputs, [...outputs, fee]);
```

| Operation                                           | Guarantee                                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `plus`, `minus`, `compare`                          | only between the same unit; `minus` refuses a result below zero                        |
| `sumQuantities(unit, items)`                        | the total, zero for an empty list                                                      |
| `settle(unit, inputs, outputs)`                     | what is left over, so inputs = outputs + result; refuses spending more than the inputs |
| `mulDiv(numerator, denominator, 'floor' \| 'ceil')` | within one unit of exact, on the side you chose                                        |
| `clamp(min, max)`                                   | always inside the range; refuses a range that is upside down                           |
| `times(other, unit)`                                | the only way to change unit, and you name the result                                   |

Mixing units, such as comparing a fee rate with a balance, is a type error and also throws at run time.

## Web origins

`webOrigin(url)` returns scheme, host and port in canonical form and refuses anything that is not `http` or `https`. `isSameWebOrigin(a, b)` is true only when all three match. Use the origin, never the hostname, as the key for anything a site is allowed to do.

## Adding a block

1. Add the block to its file under `src`.
2. Add it to the generators in the spec file, so the general properties cover it.
3. Add a property that states what the block writes, and fixed examples for its exact output.

## Running the checks

```bash
pnpm test:unit
```
