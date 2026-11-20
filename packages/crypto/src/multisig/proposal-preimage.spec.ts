import { bytesToHex } from '@noble/hashes/utils';
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import {
  askLeanOracle,
  encodeText,
  expectAgreementWithLeanModel,
  leanCall,
  leanOracleAvailable,
} from '../proofs/lean-oracle';
import { multisigProposalDomainTag } from './proposal-hash';
import { encodeProposalPreimage } from './proposal-preimage';

interface PreimageInput {
  domainTag: string;
  multisigAddress: string;
  rawPayload: Uint8Array;
  proposalTimestamp: number;
}

const u32Bytes = 4;
const u64Bytes = 8;
const twoToThe32 = 2 ** 32;
const twoToThe64 = 2 ** 64;

function referenceU32(value: number): Buffer {
  const buffer = Buffer.alloc(u32Bytes);
  buffer.writeUInt32BE(value);
  return buffer;
}

function referencePreimage(input: PreimageInput): Uint8Array {
  const tag = Buffer.from(input.domainTag, 'utf8');
  const address = Buffer.from(input.multisigAddress, 'utf8');
  const timestamp = Buffer.alloc(u64Bytes);
  timestamp.writeBigUInt64BE(BigInt(input.proposalTimestamp));
  return new Uint8Array(
    Buffer.concat([
      referenceU32(tag.length),
      tag,
      referenceU32(address.length),
      address,
      referenceU32(input.rawPayload.length),
      Buffer.from(input.rawPayload),
      timestamp,
    ])
  );
}

function parsePreimage(preimage: Uint8Array): PreimageInput {
  const buffer = Buffer.from(preimage);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let offset = 0;
  function readField(): Buffer {
    const length = buffer.readUInt32BE(offset);
    const field = buffer.subarray(offset + u32Bytes, offset + u32Bytes + length);
    expect(field.length).toBe(length);
    offset += u32Bytes + length;
    return field;
  }
  const tag = readField();
  const address = readField();
  const payload = readField();
  const timestamp = buffer.readBigUInt64BE(offset);
  expect(offset + u64Bytes).toBe(buffer.length);
  return {
    domainTag: decoder.decode(tag),
    multisigAddress: decoder.decode(address),
    rawPayload: new Uint8Array(payload),
    proposalTimestamp: Number(timestamp),
  };
}

function isAcceptedTimestamp(value: unknown): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function survivesUtf8RoundTrip(value: string): boolean {
  return Buffer.from(value, 'utf8').toString('utf8') === value;
}

function encodeRawValues(input: unknown): unknown {
  return Reflect.apply(encodeProposalPreimage, undefined, [input]);
}

function asciiFromBytes(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

const prefixLookalikeBytes = [0x00, 0x01, 0x04, 0x08, 0x1c, 0x61];

const textArbitrary = fc.oneof(
  fc.string({ unit: 'binary' }),
  fc.string(),
  fc.string({
    unit: fc.constantFrom(...prefixLookalikeBytes.map(byte => asciiFromBytes(Uint8Array.of(byte)))),
  }),
  fc.constantFrom('', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'адрес-🔐-多重署名')
);

const payloadArbitrary = fc.oneof(
  fc.uint8Array({ maxLength: 512 }),
  fc
    .array(fc.constantFrom(...prefixLookalikeBytes), { maxLength: 24 })
    .map(bytes => Uint8Array.from(bytes)),
  fc.constant(new Uint8Array(0))
);

const timestampArbitrary = fc.oneof(
  fc.maxSafeNat(),
  fc.nat(),
  fc.constantFrom(0, 1, twoToThe32 - 1, twoToThe32, Number.MAX_SAFE_INTEGER)
);

const wellFormedInputArbitrary = fc.record({
  domainTag: fc.oneof(fc.constant(multisigProposalDomainTag), textArbitrary),
  multisigAddress: textArbitrary,
  rawPayload: payloadArbitrary,
  proposalTimestamp: timestampArbitrary,
});

const rawNumberArbitrary = fc.oneof(
  fc.double(),
  fc.integer(),
  fc.maxSafeInteger(),
  fc.constantFrom(
    -1,
    -0,
    0.5,
    1.5,
    -2048,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER + 1,
    Number.MAX_SAFE_INTEGER + 2,
    twoToThe64 - 2048,
    twoToThe64,
    Number.MAX_VALUE,
    Number.MIN_VALUE,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY
  )
);

const utf16CodeUnitsArbitrary = fc
  .array(
    fc.oneof(
      fc.integer({ min: 0, max: 0xffff }),
      fc.integer({ min: 0xd800, max: 0xdfff }),
      fc.integer({ min: 0x20, max: 0x7e })
    ),
    { maxLength: 12 }
  )
  .map(units => String.fromCharCode(...units));

const sampleInput: PreimageInput = {
  domainTag: multisigProposalDomainTag,
  multisigAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
  rawPayload: Uint8Array.of(0x70, 0x73, 0x62, 0x74, 0xff, 0x01, 0x00),
  proposalTimestamp: 1_750_000_000,
};

describe(encodeProposalPreimage.name, () => {
  test('matches the fixed preimage vectors', () => {
    expect(
      bytesToHex(
        encodeProposalPreimage({
          domainTag: multisigProposalDomainTag,
          multisigAddress: '',
          rawPayload: new Uint8Array(0),
          proposalTimestamp: 0,
        })
      )
    ).toBe(
      '0000001c6c6561746865722d6d756c74697369672d70726f706f73616c2d7631' +
        '00000000' +
        '00000000' +
        '0000000000000000'
    );
    expect(bytesToHex(encodeProposalPreimage(sampleInput))).toBe(
      '0000001c6c6561746865722d6d756c74697369672d70726f706f73616c2d7631' +
        '0000002a' +
        '6263317177353038643671656a7874646734793572337a6172766172793063357877376b763866337434' +
        '00000007' +
        '70736274ff0100' +
        '00000000684ee180'
    );
  });

  test('lays fields out as length-prefixed tag, address, payload, then a u64 timestamp', () => {
    fc.assert(
      fc.property(wellFormedInputArbitrary, input => {
        expect(bytesToHex(encodeProposalPreimage(input))).toBe(
          bytesToHex(referencePreimage(input))
        );
      })
    );
  });

  test('parses back to exactly the input that produced it', () => {
    fc.assert(
      fc.property(wellFormedInputArbitrary, input => {
        expect(parsePreimage(encodeProposalPreimage(input))).toEqual(input);
      })
    );
  });

  test('gives two inputs the same preimage only when the inputs are equal', () => {
    fc.assert(
      fc.property(wellFormedInputArbitrary, wellFormedInputArbitrary, (left, right) => {
        const sameInput =
          left.domainTag === right.domainTag &&
          left.multisigAddress === right.multisigAddress &&
          bytesToHex(left.rawPayload) === bytesToHex(right.rawPayload) &&
          left.proposalTimestamp === right.proposalTimestamp;
        const samePreimage =
          bytesToHex(encodeProposalPreimage(left)) === bytesToHex(encodeProposalPreimage(right));
        expect(samePreimage).toBe(sameInput);
      })
    );
  });

  test('changes when any single field changes', () => {
    fc.assert(
      fc.property(wellFormedInputArbitrary, wellFormedInputArbitrary, (input, other) => {
        const base = bytesToHex(encodeProposalPreimage(input));
        fc.pre(input.domainTag !== other.domainTag);
        fc.pre(input.multisigAddress !== other.multisigAddress);
        fc.pre(bytesToHex(input.rawPayload) !== bytesToHex(other.rawPayload));
        fc.pre(input.proposalTimestamp !== other.proposalTimestamp);
        expect(
          bytesToHex(encodeProposalPreimage({ ...input, domainTag: other.domainTag }))
        ).not.toBe(base);
        expect(
          bytesToHex(encodeProposalPreimage({ ...input, multisigAddress: other.multisigAddress }))
        ).not.toBe(base);
        expect(
          bytesToHex(encodeProposalPreimage({ ...input, rawPayload: other.rawPayload }))
        ).not.toBe(base);
        expect(
          bytesToHex(
            encodeProposalPreimage({ ...input, proposalTimestamp: other.proposalTimestamp })
          )
        ).not.toBe(base);
      })
    );
  });

  test('keeps bytes moved across the address and payload boundary distinguishable', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 16 }),
        fc.uint8Array({ max: 0x7f, maxLength: 16 }),
        fc.uint8Array({ maxLength: 16 }),
        timestampArbitrary,
        (address, movedBytes, tail, proposalTimestamp) => {
          const payload = Uint8Array.from([...movedBytes, ...referenceU32(tail.length), ...tail]);
          const twinAddress =
            address + asciiFromBytes(referenceU32(payload.length)) + asciiFromBytes(movedBytes);
          const original = encodeProposalPreimage({
            domainTag: multisigProposalDomainTag,
            multisigAddress: address,
            rawPayload: payload,
            proposalTimestamp,
          });
          const twin = encodeProposalPreimage({
            domainTag: multisigProposalDomainTag,
            multisigAddress: twinAddress,
            rawPayload: tail,
            proposalTimestamp,
          });
          expect(bytesToHex(twin)).not.toBe(bytesToHex(original));
        }
      )
    );
  });

  test('keeps bytes moved across the domain tag and address boundary distinguishable', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 16 }),
        fc.string({ maxLength: 16 }),
        fc.string({ maxLength: 16 }),
        (tag, movedText, tail) => {
          const address = movedText + asciiFromBytes(referenceU32(tail.length)) + tail;
          const twinTag = tag + asciiFromBytes(referenceU32(address.length)) + movedText;
          const original = encodeProposalPreimage({
            ...sampleInput,
            domainTag: tag,
            multisigAddress: address,
          });
          const twin = encodeProposalPreimage({
            ...sampleInput,
            domainTag: twinTag,
            multisigAddress: tail,
          });
          expect(bytesToHex(twin)).not.toBe(bytesToHex(original));
        }
      )
    );
  });

  test('starts every preimage with the length-prefixed domain tag', () => {
    const tagHeader = bytesToHex(
      Uint8Array.from([
        ...referenceU32(multisigProposalDomainTag.length),
        ...Buffer.from(multisigProposalDomainTag, 'ascii'),
      ])
    );
    fc.assert(
      fc.property(wellFormedInputArbitrary, input => {
        const preimage = encodeProposalPreimage({
          ...input,
          domainTag: multisigProposalDomainTag,
        });
        expect(bytesToHex(preimage).startsWith(tagHeader)).toBe(true);
      })
    );
  });

  test('accepts a timestamp only when it is a non-negative safe integer', () => {
    fc.assert(
      fc.property(rawNumberArbitrary, proposalTimestamp => {
        const input = { ...sampleInput, proposalTimestamp };
        if (isAcceptedTimestamp(proposalTimestamp)) {
          expect(
            parsePreimage(encodeProposalPreimage(input)).proposalTimestamp === proposalTimestamp
          ).toBe(true);
          return;
        }
        expect(() => encodeProposalPreimage(input)).toThrowError(RangeError);
      })
    );
  });

  test('never maps two different numbers to the same timestamp bytes', () => {
    fc.assert(
      fc.property(rawNumberArbitrary, rawNumberArbitrary, (left, right) => {
        fc.pre(isAcceptedTimestamp(left) && isAcceptedTimestamp(right));
        const leftPreimage = encodeProposalPreimage({ ...sampleInput, proposalTimestamp: left });
        const rightPreimage = encodeProposalPreimage({ ...sampleInput, proposalTimestamp: right });
        expect(bytesToHex(leftPreimage) === bytesToHex(rightPreimage)).toBe(left === right);
      })
    );
  });

  test.each([
    ['2^64 would wrap to 0', twoToThe64],
    ['-2048 would wrap to 2^64 - 2048', -2048],
    ['-1 would wrap to 2^64 - 1', -1],
    ['2^53 is not exactly representable by every party', Number.MAX_SAFE_INTEGER + 1],
    ['fractions', 1.5],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('rejects timestamp: %s', (_label, proposalTimestamp) => {
    expect(() => encodeProposalPreimage({ ...sampleInput, proposalTimestamp })).toThrowError(
      'Proposal timestamp must be a non-negative safe integer.'
    );
  });

  test('rejects timestamps that are not JavaScript numbers', () => {
    fc.assert(
      fc.property(fc.anything(), proposalTimestamp => {
        fc.pre(!isAcceptedTimestamp(proposalTimestamp));
        expect(() => encodeRawValues({ ...sampleInput, proposalTimestamp })).toThrowError();
      })
    );
    expect(() => encodeRawValues({ ...sampleInput, proposalTimestamp: '5' })).toThrowError();
    expect(() => encodeRawValues({ ...sampleInput, proposalTimestamp: 5n })).toThrowError();
    expect(() => encodeRawValues({ ...sampleInput, proposalTimestamp: true })).toThrowError();
  });

  test('rejects payloads that are not byte arrays', () => {
    fc.assert(
      fc.property(fc.anything(), rawPayload => {
        expect(() => encodeRawValues({ ...sampleInput, rawPayload })).toThrowError();
      })
    );
    expect(() => encodeRawValues({ ...sampleInput, rawPayload: [1, 2, 3] })).toThrowError();
    expect(() => encodeRawValues({ ...sampleInput, rawPayload: '70736274' })).toThrowError();
  });

  test('rejects addresses that are not strings', () => {
    fc.assert(
      fc.property(fc.anything(), multisigAddress => {
        fc.pre(typeof multisigAddress !== 'string');
        expect(() => encodeRawValues({ ...sampleInput, multisigAddress })).toThrowError();
      })
    );
  });

  test('accepts text only when it is well-formed Unicode', () => {
    fc.assert(
      fc.property(utf16CodeUnitsArbitrary, text => {
        function encodeAsAddress() {
          return encodeProposalPreimage({ ...sampleInput, multisigAddress: text });
        }
        function encodeAsTag() {
          return encodeProposalPreimage({ ...sampleInput, domainTag: text });
        }
        if (survivesUtf8RoundTrip(text)) {
          expect(parsePreimage(encodeAsAddress()).multisigAddress).toBe(text);
          expect(parsePreimage(encodeAsTag()).domainTag).toBe(text);
          return;
        }
        expect(encodeAsAddress).toThrowError(TypeError);
        expect(encodeAsTag).toThrowError(TypeError);
      })
    );
  });

  test('rejects lone surrogates that UTF-8 encoding would collapse into U+FFFD', () => {
    expect(() =>
      encodeProposalPreimage({ ...sampleInput, multisigAddress: '\ud800' })
    ).toThrowError('Proposal preimage text must not contain lone surrogates.');
    expect(() =>
      encodeProposalPreimage({ ...sampleInput, multisigAddress: 'bc1q\udfffabc' })
    ).toThrowError('Proposal preimage text must not contain lone surrogates.');
    expect(
      parsePreimage(encodeProposalPreimage({ ...sampleInput, multisigAddress: '�' }))
        .multisigAddress
    ).toBe('�');
  });

  test('rejects a field whose length does not fit in the u32 prefix', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom(twoToThe32, twoToThe32 + 5, Number.MAX_SAFE_INTEGER, 1.5, -1),
          fc.integer({ min: twoToThe32, max: Number.MAX_SAFE_INTEGER })
        ),
        claimedLength => {
          const rawPayload = Object.defineProperty(new Uint8Array(1), 'length', {
            value: claimedLength,
          });
          expect(() => encodeProposalPreimage({ ...sampleInput, rawPayload })).toThrowError(
            'Proposal preimage field length must fit in an unsigned 32-bit integer.'
          );
        }
      )
    );
  });
});

function leanPreimageCall(input: PreimageInput): string {
  return leanCall(
    'encodeProposalPreimage',
    encodeText(input.domainTag),
    encodeText(input.multisigAddress),
    bytesToHex(input.rawPayload),
    input.proposalTimestamp.toString()
  );
}

function observedPreimage(input: PreimageInput): string {
  return `ok ${bytesToHex(encodeProposalPreimage(input))}`;
}

describe('Lean model of the proposal preimage', () => {
  test.skipIf(!leanOracleAvailable)(
    'agrees with the TypeScript encoder on the fixed vector',
    () => {
      expect(askLeanOracle([leanPreimageCall(sampleInput)])).toEqual([
        observedPreimage(sampleInput),
      ]);
    }
  );

  test.skipIf(!leanOracleAvailable)(
    'agrees with the TypeScript encoder on generated inputs',
    () => {
      expectAgreementWithLeanModel(
        wellFormedInputArbitrary,
        input => ({ call: leanPreimageCall(input), observed: observedPreimage(input) }),
        { minimumSupportedShare: 1 }
      );
    }
  );

  test.skipIf(!leanOracleAvailable)('refuses a timestamp outside its u64 precondition', () => {
    const call = leanCall(
      'encodeProposalPreimage',
      encodeText('a'),
      encodeText('b'),
      '',
      '18446744073709551616'
    );
    expect(askLeanOracle([call])).toEqual(['unsupported']);
  });
});
