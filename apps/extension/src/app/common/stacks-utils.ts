import type BigNumber from 'bignumber.js';

import { STX_DECIMALS } from '@leather.io/constants';
import { microStxToStx } from '@leather.io/utils';

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

/** @knipignore */
export function isFtNameLikeStx(name: string) {
  return ['stx', 'stack', 'stacks'].includes(convertUnicodeToAscii(name).toLocaleLowerCase());
}

export function getSafeImageCanonicalUri(imageCanonicalUri: string, name: string) {
  return imageCanonicalUri && isValidUrl(imageCanonicalUri) && !isFtNameLikeStx(name)
    ? imageCanonicalUri
    : undefined;
}
