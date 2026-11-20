# `@leather.io/kernel`

Building blocks whose properties are proved once, in Lean, for every way they can be combined. Code assembled only from these blocks inherits the properties, so it needs no proof of its own.

All Lean in the monorepo that backs these guarantees lives in this package. A package that uses the kernel adds none.

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

### What is proved

`src/codec/CodecProofs.lean` proves these for every codec that can be built, by induction over how it was built:

| Theorem              | In plain words                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `encode_injective`   | No two values share an encoding.                                                                       |
| `encode_append_inj`  | An encoded value can be split off the front of a stream in only one way.                               |
| `decodeExact_encode` | Decoding what was encoded returns the same value.                                                      |
| `encode_decodeExact` | Decoding accepts only the bytes encoding would write, so no two byte strings decode to the same value. |

Messages that end with the rest of the bytes have the same three properties (`decodeWithTail_encodeWithTail`, `encodeWithTail_decodeWithTail`, `encodeWithTail_injective`).

### What is tested, not proved

The proofs are about the Lean model in `src/codec/Codec.lean`. `src/codec/codec.spec.ts` ties the TypeScript to it by sending the same questions to both and comparing every answer. That gap is the same size however many codecs are built on the kernel. Five checks keep the two from drifting apart unnoticed:

- every codec up to a small size is compared on a fixed set of values and on every short byte string
- random codecs, values and damaged bytes cover what lies beyond that
- `src/oracle.spec.ts` fails if the Lean model and the TypeScript list different blocks
- the same spec fails if the oracle binary was built from model sources other than the ones on disk
- `pnpm lt kernel mutation-gate` breaks the TypeScript on purpose in each way listed in `tools/src/kernel/kernel-mutants.ts` and fails unless the tests notice

### What you do not get

- Proof that a codec is the right one for your protocol. Field order and types are your choice.
- Anything about code around the codec. A function that adds its own branching or byte handling before or after is outside the guarantee.
- Injectivity across different codecs. Start a hashed or signed layout with a `text` or `constant` naming the protocol and version.

## Adding a block

1. Add the constructor to `Shape` in `Codec.lean` with its `encode` and `decode` cases.
2. Extend `decode_encode` and `encode_decode` in `CodecProofs.lean`. The build fails until every shape is covered. A changed or new theorem statement must also be updated in `src/theorem-statements.txt`.
3. Add the block to `codec.ts`, the oracle in `src/Oracle.lean`, and the generators in `codec.spec.ts`.

## Checking the proofs

Needs [elan](https://github.com/leanprover/elan). From this directory:

```bash
lake build --wfail
pnpm test:unit
```

Without the built oracle the differential tests show as skipped. Set `REQUIRE_LEAN_ORACLE=1` to make its absence a failure.
