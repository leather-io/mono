import { ChainId } from '@stacks/network';
import BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import type { NetworkConfiguration } from '@leather.io/models';
import { contractPrincipalSchema, principalSchema } from '@leather.io/stacks';
import { initBigNumber, microStxToStx } from '@leather.io/utils';

import { isValidUrl } from '@shared/utils/urls';

import { abbreviateNumber } from '@app/common/utils';

import { convertUnicodeToAscii } from './string-utils';

export function stacksValue({
  value,
  fixedDecimals = true,
  withTicker = true,
  abbreviate = false,
}: {
  value: number | string | BigNumber;
  fixedDecimals?: boolean;
  withTicker?: boolean;
  abbreviate?: boolean;
}) {
  const stacks = microStxToStx(value);
  const stxAmount = stacks.toNumber();
  return `${
    abbreviate && stxAmount > 10000
      ? abbreviateNumber(stxAmount)
      : stxAmount.toLocaleString('en-US', {
          maximumFractionDigits: fixedDecimals ? STX_DECIMALS : 3,
        })
  }${withTicker ? ' STX' : ''}`;
}

export function ftDecimals(value: number | string | BigNumber, decimals: number) {
  const amount = initBigNumber(value);
  return amount
    .shiftedBy(-decimals)
    .toNumber()
    .toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export function ftUnshiftDecimals(value: number | string | BigNumber, decimals: number) {
  const amount = initBigNumber(value);
  return amount.shiftedBy(decimals).toString(10);
}

function extractAddressFromStacksPrincipal(principal: string) {
  if (contractPrincipalSchema.safeParse(principal).success) {
    return principal.split('.')[0];
  }
  return principal;
}

export function validateStacksAddress(stacksAddress: string): boolean {
  return principalSchema.safeParse(stacksAddress).success;
}

export function validateAddressChain(address: string, currentNetwork: NetworkConfiguration) {
  if (!principalSchema.safeParse(address).success) {
    return false;
  }

  const addressToCheck = extractAddressFromStacksPrincipal(address);

  const prefix = addressToCheck.slice(0, 2);
  switch (currentNetwork.chain.stacks.chainId) {
    case ChainId.Mainnet:
      return prefix === 'SM' || prefix === 'SP';
    case ChainId.Testnet:
    default:
      return prefix === 'SN' || prefix === 'ST';
  }
}

/** @knipignore */
export function isFtNameLikeStx(name: string) {
  return ['stx', 'stack', 'stacks'].includes(convertUnicodeToAscii(name).toLocaleLowerCase());
}

export function getSafeImageCanonicalUri(imageCanonicalUri: string, name: string) {
  return imageCanonicalUri && isValidUrl(imageCanonicalUri) && !isFtNameLikeStx(name)
    ? imageCanonicalUri
    : '';
}
