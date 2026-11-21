import {
  characters,
  charactersExcept,
  charactersIn,
  fields,
  fieldsThenMore,
  leading,
  numeral,
  optionalSuffix,
  prefixed,
  separated,
} from '@leather.io/kernel';

const fingerprintLength = 8;

const pathSegment = optionalSuffix("'", numeral(10));
const pathRoot = characters(charactersExcept('/'), { minLength: 1 });
const fingerprintText = characters(charactersIn('09', 'af'), {
  minLength: 1,
  maxLength: fingerprintLength,
});

const segments = leading('/', pathSegment, pathSegment);
const segmentsToAccount = fieldsThenMore(
  '/',
  ['purpose', pathSegment],
  ['coinType', pathSegment],
  ['account', pathSegment],
  ['rest', pathSegment]
);

export const pathToPurpose = fieldsThenMore(
  '/',
  ['root', pathRoot],
  ['purpose', pathSegment],
  ['rest', pathSegment]
);
export const pathToAccount = fieldsThenMore(
  '/',
  ['root', pathRoot],
  ['purpose', pathSegment],
  ['coinType', pathSegment],
  ['account', pathSegment],
  ['rest', pathSegment]
);
export const pathToChange = fieldsThenMore(
  '/',
  ['root', pathRoot],
  ['purpose', pathSegment],
  ['coinType', pathSegment],
  ['account', pathSegment],
  ['change', pathSegment],
  ['rest', pathSegment]
);
export const pathToAddressIndex = fieldsThenMore(
  '/',
  ['root', pathRoot],
  ['purpose', pathSegment],
  ['coinType', pathSegment],
  ['account', pathSegment],
  ['change', pathSegment],
  ['addressIndex', pathSegment],
  ['rest', pathSegment]
);
export const accountLevelPath = fields(
  '/',
  ['root', pathRoot],
  ['purpose', pathSegment],
  ['coinType', pathSegment],
  ['account', pathSegment]
);

export const derivationPath = prefixed('m/', segments);
export const accountDerivationPath = prefixed('m/', segmentsToAccount);

export const keyOriginPathOfAnyDepth = fields(
  '/',
  ['fingerprint', fingerprintText],
  ['path', segments]
);
export const keyOriginPathFromSegments = fields(
  '/',
  ['fingerprint', fingerprintText],
  ['segments', separated('/', pathSegment)]
);
export const accountKeyOriginPath = fields(
  '/',
  ['fingerprint', fingerprintText],
  ['path', segmentsToAccount]
);
export const descriptorText = prefixed(
  '[',
  fields(
    ']',
    ['keyOrigin', accountKeyOriginPath],
    ['key', characters(charactersExcept('[', ']'), { minLength: 1 })]
  )
);
