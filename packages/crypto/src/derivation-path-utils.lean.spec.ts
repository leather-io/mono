import fc from 'fast-check';
import { describe, test } from 'vitest';

import {
  appendAddressIndexToPath,
  createDescriptor,
  createKeyOriginPath,
  extractAccountIndexFromDescriptor,
  extractAccountIndexFromPath,
  extractAccountPathFromFullPath,
  extractAddressIndexFromPath,
  extractChangeIndexFromPath,
  extractDerivationPathFromDescriptor,
  extractFingerprintFromDescriptor,
  extractFingerprintFromKeyOriginPath,
  extractKeyFromDescriptor,
  extractKeyOriginPathFromDescriptor,
  extractPurposeFromPath,
  keyOriginToDerivationPath,
  validateKeyOriginPath,
} from './derivation-path-utils';
import {
  encodeText,
  expectAgreementWithLeanModel,
  leanCall,
  leanOracleAvailable,
  observeText,
  observeValue,
} from './proofs/lean-oracle';

const hexDigits = Array.from('0123456789abcdefABCDEF');

const fingerprintArbitrary = fc.oneof(
  fc.string({ unit: fc.constantFrom(...hexDigits), minLength: 8, maxLength: 8 }),
  fc.string({ unit: fc.constantFrom(...hexDigits), maxLength: 10 }),
  fc.constantFrom('', 'xyz', '0a3fd8ef', 'm')
);

const segmentArbitrary = fc.oneof(
  fc.nat().map(String),
  fc.nat({ max: 200 }).map(index => `${index}'`),
  fc.maxSafeNat().map(String),
  fc.constantFrom(
    '',
    'm',
    "'",
    'abc',
    '1x',
    '-1',
    '+2',
    ' 3',
    '0x10',
    '007',
    "8'4'",
    '9007199254740991',
    '9007199254740992',
    '[',
    ']',
    'é'
  )
);

const pathArbitrary = fc.oneof(
  fc.array(segmentArbitrary, { maxLength: 7 }).map(parts => parts.join('/')),
  fc
    .tuple(fingerprintArbitrary, fc.array(segmentArbitrary, { maxLength: 6 }))
    .map(([fingerprint, parts]) => [fingerprint, ...parts].join('/')),
  fc.array(segmentArbitrary, { maxLength: 6 }).map(parts => ['m', ...parts].join('/')),
  fc.string({ maxLength: 12 }),
  fc.string({ unit: 'binary', maxLength: 8 })
);

const keyArbitrary = fc.oneof(
  fc.constantFrom('xpub6CUGRU', 'tpubD', '', 'a]b', '[x]', ']'),
  fc.string({ maxLength: 8 })
);

const descriptorArbitrary = fc.oneof(
  fc.tuple(pathArbitrary, keyArbitrary).map(([path, key]) => `[${path}]${key}`),
  fc.tuple(pathArbitrary, keyArbitrary).map(([path, key]) => `${path}]${key}`),
  pathArbitrary,
  fc.string({ maxLength: 12 })
);

const indexArbitrary = fc.oneof(fc.nat(), fc.maxSafeNat(), fc.constantFrom(0, 1));

const pathExtractors = [
  extractPurposeFromPath,
  extractAccountIndexFromPath,
  extractChangeIndexFromPath,
  extractAddressIndexFromPath,
].map((extract, index) => ({
  name: [
    'extractPurposeFromPath',
    'extractAccountIndexFromPath',
    'extractChangeIndexFromPath',
    'extractAddressIndexFromPath',
  ][index],
  extract,
}));

const descriptorReaders = [
  { name: 'extractKeyOriginPathFromDescriptor', read: extractKeyOriginPathFromDescriptor },
  { name: 'extractDerivationPathFromDescriptor', read: extractDerivationPathFromDescriptor },
  { name: 'extractFingerprintFromDescriptor', read: extractFingerprintFromDescriptor },
  { name: 'extractKeyFromDescriptor', read: extractKeyFromDescriptor },
];

describe.skipIf(!leanOracleAvailable)('Lean model of derivation-path-utils', () => {
  test.each(pathExtractors)('$name agrees with the model', ({ name, extract }) => {
    expectAgreementWithLeanModel(pathArbitrary, path => ({
      call: leanCall(name, encodeText(path)),
      observed: observeValue(() => extract(path)),
    }));
  });

  test('appendAddressIndexToPath agrees with the model', () => {
    expectAgreementWithLeanModel(
      fc.tuple(pathArbitrary, indexArbitrary, indexArbitrary),
      ([path, change, addressIndex]) => ({
        call: leanCall(
          'appendAddressIndexToPath',
          encodeText(path),
          String(change),
          String(addressIndex)
        ),
        observed: observeText(() => appendAddressIndexToPath(path, change, addressIndex)),
      })
    );
  });

  test('extractFingerprintFromKeyOriginPath agrees with the model', () => {
    expectAgreementWithLeanModel(
      pathArbitrary,
      path => ({
        call: leanCall('extractFingerprintFromKeyOriginPath', encodeText(path)),
        observed: observeText(() => extractFingerprintFromKeyOriginPath(path)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('createKeyOriginPath agrees with the model', () => {
    expectAgreementWithLeanModel(
      fc.tuple(fingerprintArbitrary, pathArbitrary),
      ([fingerprint, path]) => ({
        call: leanCall('createKeyOriginPath', encodeText(fingerprint), encodeText(path)),
        observed: observeText(() => createKeyOriginPath(fingerprint, path)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('validateKeyOriginPath agrees with the model', () => {
    expectAgreementWithLeanModel(
      pathArbitrary,
      path => ({
        call: leanCall('validateKeyOriginPath', encodeText(path)),
        observed: observeValue(() => validateKeyOriginPath(path)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('createDescriptor agrees with the model', () => {
    expectAgreementWithLeanModel(
      fc.tuple(pathArbitrary, keyArbitrary),
      ([path, key]) => ({
        call: leanCall('createDescriptor', encodeText(path), encodeText(key)),
        observed: observeText(() => createDescriptor(path, key)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test.each(descriptorReaders)('$name agrees with the model', ({ name, read }) => {
    expectAgreementWithLeanModel(
      descriptorArbitrary,
      descriptor => ({
        call: leanCall(name, encodeText(descriptor)),
        observed: observeText(() => read(descriptor)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('extractAccountIndexFromDescriptor agrees with the model', () => {
    expectAgreementWithLeanModel(descriptorArbitrary, descriptor => ({
      call: leanCall('extractAccountIndexFromDescriptor', encodeText(descriptor)),
      observed: observeValue(() => extractAccountIndexFromDescriptor(descriptor)),
    }));
  });

  test('extractAccountPathFromFullPath agrees with the model', () => {
    expectAgreementWithLeanModel(
      pathArbitrary,
      path => ({
        call: leanCall('extractAccountPathFromFullPath', encodeText(path)),
        observed: observeText(() => extractAccountPathFromFullPath(path)),
      }),
      { minimumSupportedShare: 1 }
    );
  });

  test('keyOriginToDerivationPath agrees with the model', () => {
    expectAgreementWithLeanModel(
      pathArbitrary,
      path => ({
        call: leanCall('keyOriginToDerivationPath', encodeText(path)),
        observed: observeText(() => keyOriginToDerivationPath(path)),
      }),
      { minimumSupportedShare: 1 }
    );
  });
});
