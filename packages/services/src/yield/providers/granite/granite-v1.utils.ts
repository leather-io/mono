import { ClarityValue, cvToString, getCVTypeString } from '@stacks/transactions';

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

interface GraniteUserPositionResponse {
  debtShares: bigint;
  collaterals: string[];
  borrowedAmount: bigint;
  borrowedBlock: bigint;
}

export function parseGraniteProtocolGetUserPositionResponseCV(
  response: ClarityValue
): GraniteUserPositionResponse | null {
  if (isClarityOptionalNone(response) || isClarityResponseError(response)) {
    return null;
  }

  if (
    (isClarityOptionalSome(response) || isClarityResponseOk(response)) &&
    isClarityTuple(response.value)
  ) {
    const debtShares = response.value.value['debt-shares'];
    const collaterals = response.value.value['collaterals'];
    const borrowedAmount = response.value.value['borrowed-amount'];
    const borrowedBlock = response.value.value['borrowed-block'];

    if (
      !isClarityUInt(debtShares) ||
      !isClarityUInt(borrowedAmount) ||
      !isClarityUInt(borrowedBlock)
    ) {
      throw new Error('Unexpected Granite get-user-position response: expected UInt fields');
    }

    if (!isClarityList(collaterals)) {
      throw new Error(
        'Unexpected Granite get-user-position response: expected List for collaterals'
      );
    }

    return {
      debtShares: BigInt(debtShares.value),
      collaterals: collaterals.value.filter(isClarityPrincipal).map(getClarityPrincipal),
      borrowedAmount: BigInt(borrowedAmount.value),
      borrowedBlock: BigInt(borrowedBlock.value),
    };
  }

  throw new Error(
    `Unexpected Granite get-user-position Clarity Value type: ${getCVTypeString(response)}`
  );
}

export function parseGraniteProtocolGetUserCollateralResponseCV(
  response: ClarityValue
): bigint | null {
  if (isClarityOptionalNone(response) || isClarityResponseError(response)) {
    return null;
  }

  if (
    (isClarityOptionalSome(response) || isClarityResponseOk(response)) &&
    isClarityTuple(response.value)
  ) {
    const amount = response.value.value['amount'];

    if (!isClarityUInt(amount)) {
      throw new Error('Unexpected Granite get-user-collateral response: expected UInt for amount');
    }

    return BigInt(amount.value);
  }

  throw new Error(
    `Unexpected Granite get-user-collateral Clarity Value type: ${getCVTypeString(response)}`
  );
}

export function parseGraniteProtocolGetBalanceResponseCV(response: ClarityValue): bigint {
  if (isClarityResponseError(response)) {
    throw new Error(`Granite get-balance error: ${cvToString(response.value)}`);
  }

  if (isClarityResponseOk(response)) {
    const ok = response.value;
    if (!isClarityUInt(ok)) {
      throw new Error('Unexpected Granite get-balance response: expected UInt in ok');
    }
    return BigInt(ok.value);
  }

  throw new Error(
    `Unexpected Granite get-balance Clarity Value type: ${getCVTypeString(response)}`
  );
}
