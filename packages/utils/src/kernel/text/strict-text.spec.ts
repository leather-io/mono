import fc from 'fast-check';
import * as P from 'micro-packed';
import { describe, expect, test } from 'vitest';

import { strictText } from './strict-text';

const runs = 2000;
const lengthPrefixSize = 4;
const prefixedText = strictText(P.U32BE);
const restText = strictText(null);
const byteOrderMark = '﻿';

function isValidUtf8(bytes: Uint8Array): boolean {
  try {
    new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function hasLoneSurrogate(text: string): boolean {
  return Array.from(text).some(character => /^[\ud800-\udfff]$/.test(character));
}

function withLength(bytes: Uint8Array): Uint8Array {
  return Uint8Array.from([...P.U32BE.encode(bytes.length), ...bytes]);
}

const wellFormedText = fc.oneof(
  fc.string({ unit: 'grapheme' }),
  fc.string({ unit: 'binary' }),
  fc.string({ unit: 'binary' }).map(text => byteOrderMark + text)
);
const anyText = fc.oneof(
  wellFormedText,
  fc.string({ unit: fc.integer({ min: 0, max: 0xffff }).map(unit => String.fromCharCode(unit)) })
);
const anyBytes = fc.oneof(
  fc.uint8Array({ maxLength: 12 }),
  wellFormedText.map(text => new TextEncoder().encode(text))
);

describe(strictText.name, () => {
  test('writes the UTF-8 byte length and then the UTF-8 bytes', () => {
    expect(prefixedText.encode('hé')).toEqual(Uint8Array.of(0, 0, 0, 3, 0x68, 0xc3, 0xa9));
    expect(prefixedText.decode(Uint8Array.of(0, 0, 0, 3, 0x68, 0xc3, 0xa9))).toBe('hé');
  });

  test('with no length, takes everything that is left', () => {
    expect(restText.encode('hi')).toEqual(Uint8Array.of(0x68, 0x69));
    expect(restText.decode(Uint8Array.of(0x68, 0x69))).toBe('hi');
  });

  test('keeps a leading byte order mark as part of the text', () => {
    expect(restText.decode(Uint8Array.of(0xef, 0xbb, 0xbf, 0x68))).toBe(byteOrderMark + 'h');
  });

  test.each([
    ['a stray continuation byte', Uint8Array.of(0x80)],
    ['a sequence cut short', Uint8Array.of(0xc3)],
    ['an overlong form', Uint8Array.of(0xc0, 0xaf)],
    ['an encoded surrogate', Uint8Array.of(0xed, 0xa0, 0x80)],
  ])('refuses %s instead of repairing it', (_name, bytes) => {
    expect(() => restText.decode(bytes)).toThrowError();
    expect(() => prefixedText.decode(withLength(bytes))).toThrowError();
  });

  test.each([['\ud800'], ['a\udfffb'], ['\udc00\ud800']])(
    'refuses text with a lone surrogate, which UTF-8 would collapse into U+FFFD',
    text => {
      expect(() => restText.encode(text)).toThrowError();
      expect(() => prefixedText.encode(text)).toThrowError();
    }
  );

  test('refuses a value that is not a string', () => {
    expect(() => {
      Reflect.apply(restText.encode, restText, [7]);
    }).toThrowError();
  });
});

describe('strict text properties', () => {
  test('reading what was written gives the text back', () => {
    fc.assert(
      fc.property(wellFormedText, text => {
        expect(restText.decode(restText.encode(text))).toBe(text);
        expect(prefixedText.decode(prefixedText.encode(text))).toBe(text);
      }),
      { numRuns: runs, endOnFailure: true }
    );
  });

  test('text is written exactly when it has no lone surrogate, as its UTF-8 bytes', () => {
    fc.assert(
      fc.property(anyText, text => {
        if (hasLoneSurrogate(text)) {
          expect(() => restText.encode(text)).toThrowError();
          expect(() => prefixedText.encode(text)).toThrowError();
          return;
        }
        const utf8 = new TextEncoder().encode(text);
        expect(restText.encode(text)).toEqual(utf8);
        expect(prefixedText.encode(text)).toEqual(withLength(utf8));
      }),
      { numRuns: runs, endOnFailure: true }
    );
  });

  test('bytes are read exactly when they are valid UTF-8, and write back unchanged', () => {
    fc.assert(
      fc.property(anyBytes, bytes => {
        if (!isValidUtf8(bytes)) {
          expect(() => restText.decode(bytes)).toThrowError();
          expect(() => prefixedText.decode(withLength(bytes))).toThrowError();
          return;
        }
        expect(restText.encode(restText.decode(bytes))).toEqual(bytes);
        expect(prefixedText.encode(prefixedText.decode(withLength(bytes)))).toEqual(
          withLength(bytes)
        );
      }),
      { numRuns: runs, endOnFailure: true }
    );
  });

  test('a length that does not match the bytes is refused', () => {
    fc.assert(
      fc.property(wellFormedText, fc.integer({ min: 1, max: 4 }), (text, extra) => {
        const encoded = prefixedText.encode(text);
        expect(() => prefixedText.decode(encoded.slice(0, -1))).toThrowError();
        expect(() =>
          prefixedText.decode(Uint8Array.from([...encoded, ...new Uint8Array(extra)]))
        ).toThrowError();
        expect(encoded.length).toBe(lengthPrefixSize + new TextEncoder().encode(text).length);
      }),
      { numRuns: runs, endOnFailure: true }
    );
  });
});
