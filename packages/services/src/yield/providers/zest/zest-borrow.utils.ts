import { ClarityValue, TupleCV, cvToString, getCVTypeString } from '@stacks/transactions';

import {
  getClarityPrincipal,
  isClarityList,
  isClarityOptionalNone,
  isClarityOptionalSome,
  isClarityPrincipal,
  isClarityResponseError,
  isClarityResponseOk,
  isClarityTuple,
  isClarityUInt,
} from '@leather.io/stacks';

interface ZestGetUserAssetsReadResponse {
  borrowedAssetPrincipals: string[];
  suppliedAssetPrincipals: string[];
}

export function parseZestGetUserAssetsReadResponseCV(
  response: ClarityValue
): ZestGetUserAssetsReadResponse {
  if (isClarityOptionalNone(response)) {
    return { borrowedAssetPrincipals: [], suppliedAssetPrincipals: [] };
  }

  if (isClarityOptionalSome(response) && isClarityTuple(response.value)) {
    return parseGetUserAssetsTuple(response.value);
  }

  if (isClarityTuple(response)) {
    return parseGetUserAssetsTuple(response);
  }

  throw new Error('Unexpected Zest get-user-assets-read Clarity Value type');

  function parseGetUserAssetsTuple(tuple: TupleCV): ZestGetUserAssetsReadResponse {
    const borrowed = tuple.value['assets-borrowed'];
    const supplied = tuple.value['assets-supplied'];

    if (!isClarityList(borrowed) || !isClarityList(supplied)) {
      throw new Error('Unexpected Zest get-user-assets-read response: expected List values');
    }

    return {
      borrowedAssetPrincipals: borrowed.value.filter(isClarityPrincipal).map(getClarityPrincipal),
      suppliedAssetPrincipals: supplied.value.filter(isClarityPrincipal).map(getClarityPrincipal),
    };
  }
}

interface ZestUserAssetBorrowBalanceResponse {
  principal: bigint;
  compoundedBalance: bigint;
  balanceIncrease: bigint;
}

export function parseZestProtocolGetUserAssetBorrowBalanceResponseCV(
  response: ClarityValue
): ZestUserAssetBorrowBalanceResponse {
  if (isClarityResponseError(response)) {
    throw new Error(cvToString(response.value));
  }

  if (isClarityResponseOk(response)) {
    const tuple = response.value;
    if (!isClarityTuple(tuple)) {
      throw new Error('Unexpected Zest get-user-borrow-balance response: expected Tuple');
    }
    const principalBalanceCV = tuple.value['principal'];
    const compoundedBalanceCV = tuple.value['compounded-balance'];
    const balanceIncreaseCV = tuple.value['balance-increase'];

    if (
      !isClarityUInt(principalBalanceCV) ||
      !isClarityUInt(compoundedBalanceCV) ||
      !isClarityUInt(balanceIncreaseCV)
    ) {
      throw new Error('Unexpected Zest get-user-borrow-balance response: expected UInt fields');
    }

    return {
      principal: BigInt(principalBalanceCV.value),
      compoundedBalance: BigInt(compoundedBalanceCV.value),
      balanceIncrease: BigInt(balanceIncreaseCV.value),
    };
  }

  throw new Error(
    `Unexpected Zest get-user-borrow-balance Clarity Value type: ${getCVTypeString(response)}`
  );
}

export function parseZestGetZTokenBalanceResponseCV(response: ClarityValue): bigint {
  if (isClarityResponseError(response)) {
    throw new Error(cvToString(response.value));
  }

  if (isClarityResponseOk(response)) {
    const ok = response.value;
    if (!isClarityUInt(ok)) throw new Error('Unexpected get-balance ok payload');
    return BigInt(ok.value);
  }

  throw new Error(
    `Unexpected Zest get-z-token-balance Clarity Value type: ${getCVTypeString(response)}`
  );
}
