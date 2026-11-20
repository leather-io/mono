import {
  characters,
  charactersExcept,
  charactersIn,
  numeral,
  optionalSuffix,
  prefixed,
  separated,
  splitAt,
} from '@leather.io/kernel';

const fingerprintLength = 8;

export const accountLevelSegments = 3;

const pathSegment = optionalSuffix("'", numeral(10));
const fingerprintText = characters(charactersIn('09', 'af'), {
  minLength: 1,
  maxLength: fingerprintLength,
});

export const rootedPath = splitAt(
  '/',
  characters(charactersExcept('/'), { minLength: 1 }),
  separated('/', pathSegment)
);
export const derivationPath = prefixed('m/', separated('/', pathSegment));
export const keyOriginPathOfAnyDepth = splitAt('/', fingerprintText, separated('/', pathSegment));
export const accountKeyOriginPath = splitAt(
  '/',
  fingerprintText,
  separated('/', pathSegment, { minCount: accountLevelSegments })
);
export const descriptorText = prefixed(
  '[',
  splitAt(']', accountKeyOriginPath, characters(charactersExcept('[', ']'), { minLength: 1 }))
);
