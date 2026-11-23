import * as P from 'micro-packed';

const firstSurrogate = 0xd800;
const lastSurrogate = 0xdfff;

function isLoneSurrogate(character: string): boolean {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && codePoint >= firstSurrogate && codePoint <= lastSurrogate;
}

const strictUtf8: P.Coder<Uint8Array, string> = {
  encode(bytes) {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  },
  decode(text) {
    if (typeof text !== 'string') throw new TypeError('Text must be a string.');
    if (Array.from(text).some(isLoneSurrogate))
      throw new RangeError('Text must not contain a lone surrogate.');
    return new TextEncoder().encode(text);
  },
};

export function strictText(length: P.Length): P.CoderType<string> {
  return P.apply(P.bytes(length), strictUtf8);
}
