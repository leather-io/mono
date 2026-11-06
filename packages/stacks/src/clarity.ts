import { ClarityType, type ClarityValue, type PrincipalCV } from '@stacks/transactions';

export function parseClarityUintResponse(response: ClarityValue): bigint {
  if (response.type === ClarityType.ResponseOk && response.value.type === ClarityType.UInt) {
    return BigInt(response.value.value);
  } else if (response.type === ClarityType.UInt) {
    return BigInt(response.value);
  }
  throw new Error('Invalid Clarity response format');
}

export function isClarityTuple(cv: ClarityValue) {
  return cv.type === ClarityType.Tuple;
}

export function isClarityResponseOk(cv: ClarityValue) {
  return cv.type === ClarityType.ResponseOk;
}

export function isClarityResponseError(cv: ClarityValue) {
  return cv.type === ClarityType.ResponseErr;
}

export function isClarityUInt(cv: ClarityValue) {
  return cv.type === ClarityType.UInt;
}

export function isClarityList(cv: ClarityValue) {
  return cv.type === ClarityType.List;
}

export function isClarityPrincipal(cv: ClarityValue) {
  return cv.type === ClarityType.PrincipalStandard || cv.type === ClarityType.PrincipalContract;
}

export function isClarityOptionalNone(cv: ClarityValue) {
  return cv.type === ClarityType.OptionalNone;
}

export function isClarityOptionalSome(cv: ClarityValue) {
  return cv.type === ClarityType.OptionalSome;
}

export function getClarityPrincipal(cv: PrincipalCV): string {
  return cv.value;
}
